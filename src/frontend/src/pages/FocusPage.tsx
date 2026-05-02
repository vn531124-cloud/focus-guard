import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStreak,
  useListTasks,
  useRecordFocusSession,
  useUpdateStreak,
} from "@/hooks/useBackend";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  CheckCircle,
  Gamepad2,
  Home,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type TimerState = "idle" | "running" | "paused" | "done";

// Confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

const CONFETTI_COLORS = [
  "oklch(0.75 0.15 190)",
  "oklch(0.72 0.17 70)",
  "oklch(0.65 0.18 145)",
  "oklch(0.75 0.2 280)",
  "oklch(0.72 0.22 35)",
];

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Spawn particles
    particlesRef.current = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 6 + 4),
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1,
    }));

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.25,
          rotation: p.rotation + p.rotationSpeed,
          life: p.life - 0.012,
        }))
        .filter((p) => p.life > 0 && p.y < canvas.height + 20);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return canvasRef;
}

export default function FocusPage() {
  const search = useSearch({ strict: false }) as { taskId?: string };
  const navigate = useNavigate();
  const taskId = search.taskId ? BigInt(search.taskId) : null;

  const { data: tasks, isLoading } = useListTasks();
  const { data: streak } = useGetStreak();
  const { mutateAsync: recordSession } = useRecordFocusSession();
  const { mutateAsync: updateStreak } = useUpdateStreak();

  const task = tasks?.find((t) => t.id === taskId) ?? null;

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [newStreak, setNewStreak] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = task ? Number(task.time) * 60 : 0;
  const elapsed = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isComplete = timerState === "done";
  const confettiCanvasRef = useConfetti(isComplete);

  // Start timer when task loads and state is idle
  function startTimer() {
    if (!task) return;
    setSecondsLeft(totalSeconds);
    setTimerState("running");
  }

  function togglePause() {
    setTimerState((s) => (s === "running" ? "paused" : "running"));
  }

  function resetTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("idle");
    setSecondsLeft(totalSeconds);
    setNewStreak(null);
  }

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setTimerState("done");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  // On complete: record session + update streak
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only re-runs on timerState change; streak/task/mutations are read at callback time
  useEffect(() => {
    if (timerState !== "done" || !task) return;

    async function handleComplete() {
      if (!task) return;
      try {
        await recordSession(task.id);

        // Compute new streak
        const today = new Date().toISOString().split("T")[0];
        const current = streak ? Number(streak.currentStreak) : 0;
        const best = streak ? Number(streak.bestStreak) : 0;
        const lastDate = streak?.lastFocusDate ?? "";

        const isNewDay = lastDate !== today;
        const newCurrentStreak = isNewDay ? current + 1 : current;
        const newBestStreak = Math.max(best, newCurrentStreak);

        await updateStreak({
          currentStreak: BigInt(newCurrentStreak),
          bestStreak: BigInt(newBestStreak),
          lastFocusDate: today,
        });

        setNewStreak(newCurrentStreak);
        toast.success("Focus session complete! 🎉", { duration: 5000 });
      } catch {
        toast.error("Could not save session. Please try again.");
      }
    }

    handleComplete();
  }, [timerState]);

  // ─── No taskId: empty state ───────────────────────────────────────────────
  if (!taskId) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center"
        data-ocid="focus.empty_state"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <Timer size={36} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          No Task Selected
        </h2>
        <p className="text-muted-foreground max-w-xs mb-6">
          Pick a task from the Dashboard to start your focused session.
        </p>
        <Link to="/">
          <Button data-ocid="focus.go_home_button">
            <Home size={15} className="mr-2" />
            Pick a task from the Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4" data-ocid="focus.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // ─── Task not found ───────────────────────────────────────────────────────
  if (!task) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center"
        data-ocid="focus.error_state"
      >
        <p className="text-muted-foreground mb-4">Task not found.</p>
        <Link to="/">
          <Button variant="outline" data-ocid="focus.go_home_button">
            <Home size={15} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // ─── Session Complete ─────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center overflow-hidden"
        data-ocid="focus.success_state"
      >
        {/* Confetti canvas */}
        <canvas
          ref={confettiCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-elevated animate-pulse">
            <CheckCircle size={48} className="text-primary" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Session Complete!
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              You crushed it — deep work done.
            </p>
          </div>

          {newStreak !== null && (
            <Card
              className="px-6 py-4 bg-card border-border flex flex-col items-center gap-1"
              data-ocid="focus.streak_update"
            >
              <span className="text-4xl font-display font-black text-primary">
                🔥 {newStreak}
              </span>
              <span className="text-xs text-muted-foreground tracking-wide uppercase">
                Day Streak
              </span>
            </Card>
          )}

          <div className="text-center px-4 py-3 bg-muted/40 rounded-xl border border-border max-w-xs">
            <p className="text-sm font-medium text-foreground">{task.action}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{task.rule}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              variant="outline"
              onClick={resetTimer}
              data-ocid="focus.reset_button"
            >
              <RotateCcw size={15} className="mr-2" />
              Do It Again
            </Button>
            <Button
              onClick={() => navigate({ to: "/games" })}
              data-ocid="focus.break_button"
            >
              <Gamepad2 size={15} className="mr-2" />
              Take a Break
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Timer View ──────────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 space-y-6" data-ocid="focus.page">
      {/* Task info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {Number(task.time)} min
          </Badge>
          <span className="text-xs text-muted-foreground">{task.rule}</span>
        </div>
        <h1 className="text-xl font-display font-bold text-foreground leading-tight">
          {task.action}
        </h1>
      </div>

      {/* Circular timer */}
      <Card
        className="p-8 bg-card border-border flex flex-col items-center gap-6"
        data-ocid="focus.timer_card"
      >
        <div className="relative w-44 h-44">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label="Focus timer progress"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              style={{ stroke: "var(--border)" }}
              strokeWidth="7"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              style={{ stroke: "var(--primary)" }}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Center display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-4xl font-mono font-bold text-foreground tabular-nums leading-none">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">
              {timerState === "idle"
                ? `${Number(task.time)} min`
                : `${Math.round(progress)}% done`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3" data-ocid="focus.controls">
          {timerState === "idle" ? (
            <Button
              size="lg"
              className="px-8"
              onClick={startTimer}
              data-ocid="focus.start_button"
            >
              <Play size={18} className="mr-2" />
              Start Focus
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={togglePause}
                data-ocid="focus.pause_button"
              >
                {timerState === "paused" ? (
                  <>
                    <Play size={16} className="mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={resetTimer}
                aria-label="Reset timer"
                data-ocid="focus.reset_button"
              >
                <RotateCcw size={16} />
              </Button>
            </>
          )}
        </div>

        {timerState === "paused" && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Timer paused — resume when ready
          </p>
        )}
      </Card>

      {/* Take a Break */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          Need a moment to breathe?
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/games" })}
          data-ocid="focus.break_button"
        >
          <Gamepad2 size={14} className="mr-2" />
          Take a Break
        </Button>
      </div>
    </div>
  );
}
