import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateTask,
  useDeleteTask,
  useGetStreak,
  useListFocusSessions,
  useListTasks,
} from "@/hooks/useBackend";
import type { Task } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ── Motivational header based on streak ──────────────────────────────────────
function getMotivation(streak: number): { title: string; sub: string } {
  if (streak === 0)
    return {
      title: "Start your journey 🌱",
      sub: "Complete your first focus session to begin your streak.",
    };
  if (streak < 3)
    return {
      title: "Great start! 🔥",
      sub: `${streak} day streak — momentum is building.`,
    };
  if (streak < 7)
    return {
      title: "Keep the fire alive! 🔥",
      sub: `${streak} days strong — don't break the chain.`,
    };
  if (streak < 14)
    return {
      title: "On fire! 🔥🔥",
      sub: `${streak} days! Consistency is your superpower.`,
    };
  return {
    title: "Unstoppable! 🔥🔥🔥",
    sub: `${streak} day streak — you're in rare company.`,
  };
}

// ── Quick-create form ─────────────────────────────────────────────────────────
function CreateTaskForm({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCreateTask();
  const [action, setAction] = useState("");
  const [time, setTime] = useState("25");
  const [rule, setRule] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!action.trim()) return;
    try {
      await mutateAsync({
        action: action.trim(),
        time: BigInt(Number(time) || 25),
        rule: rule.trim(),
      });
      toast.success("Task created!");
      onClose();
    } catch {
      toast.error("Failed to create task.");
    }
  }

  return (
    <Card
      className="p-4 border-primary/30 bg-card"
      data-ocid="dashboard.create_task_form"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-foreground">
          New Task
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close form"
          data-ocid="dashboard.create_task_form.close_button"
        >
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="task-action"
            className="text-xs text-muted-foreground"
          >
            What to do
          </Label>
          <Input
            id="task-action"
            placeholder="e.g. Read a technical paper"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-background border-input text-sm"
            data-ocid="dashboard.create_task_form.action_input"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="task-time"
              className="text-xs text-muted-foreground"
            >
              Duration (min)
            </Label>
            <Input
              id="task-time"
              type="number"
              min={1}
              max={120}
              placeholder="25"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background border-input text-sm"
              data-ocid="dashboard.create_task_form.time_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="task-rule"
              className="text-xs text-muted-foreground"
            >
              When / rule
            </Label>
            <Input
              id="task-rule"
              placeholder="e.g. Daily 9am"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              className="bg-background border-input text-sm"
              data-ocid="dashboard.create_task_form.rule_input"
            />
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          className="w-full mt-1"
          disabled={isPending || !action.trim()}
          data-ocid="dashboard.create_task_form.submit_button"
        >
          {isPending ? "Creating…" : "Create Task"}
        </Button>
      </form>
    </Card>
  );
}

// ── Single task card ──────────────────────────────────────────────────────────
function TaskCard({ task, index }: { task: Task; index: number }) {
  const { mutateAsync: deleteTask, isPending } = useDeleteTask();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteTask(task.id);
      toast.success("Task removed.");
    } catch {
      toast.error("Failed to delete task.");
    }
  }

  return (
    <Link
      to="/focus"
      search={{ taskId: String(task.id) }}
      className="block group"
      data-ocid={`dashboard.task.item.${index}`}
    >
      <Card className="p-3.5 flex items-center gap-3 bg-card border-border hover:border-primary/40 hover:bg-card/80 transition-smooth cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Clock size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-foreground text-sm truncate">
            {task.action}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0 font-body"
            >
              {Number(task.time)} min
            </Badge>
            {task.rule && (
              <span className="text-xs text-muted-foreground truncate">
                {task.rule}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
            data-ocid={`dashboard.task.delete_button.${index}`}
          >
            <Trash2 size={13} />
          </button>
          <ChevronRight
            size={15}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          />
        </div>
      </Card>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: streak, isLoading: streakLoading } = useGetStreak();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const { data: sessions, isLoading: sessionsLoading } = useListFocusSessions();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentStreak = Number(streak?.currentStreak ?? 0);
  const bestStreak = Number(streak?.bestStreak ?? 0);
  const { title: motivationTitle, sub: motivationSub } =
    getMotivation(currentStreak);

  const todaySessions = sessions?.filter((s) => {
    const today = new Date().toDateString();
    const sessionDate = new Date(
      Number(s.completedAt) / 1_000_000,
    ).toDateString();
    return today === sessionDate;
  });

  const _isLoading = streakLoading || tasksLoading || sessionsLoading;

  return (
    <div
      className="px-4 py-5 space-y-6 max-w-2xl mx-auto"
      data-ocid="dashboard.page"
    >
      {/* ── Motivational header ── */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
          {motivationTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{motivationSub}</p>
      </div>

      {/* ── Streak hero card ── */}
      <Card
        className="p-5 bg-card border-border relative overflow-hidden"
        data-ocid="dashboard.streak_card"
      >
        {/* subtle glow accent */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex items-end gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-body mb-1">
              Current Streak
            </span>
            <div className="flex items-baseline gap-2">
              {streakLoading ? (
                <Skeleton className="h-12 w-20" />
              ) : (
                <>
                  <span className="text-6xl font-display font-extrabold text-foreground leading-none">
                    {currentStreak}
                  </span>
                  <span className="text-2xl" role="img" aria-label="fire">
                    🔥
                  </span>
                  <span className="text-lg text-muted-foreground font-body">
                    days
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block font-body">
                Best Streak
              </span>
              {streakLoading ? (
                <Skeleton className="h-6 w-12 mt-0.5" />
              ) : (
                <span className="text-xl font-display font-bold text-primary">
                  {bestStreak} days
                </span>
              )}
            </div>
            <div className="text-right mt-2">
              <span className="text-xs text-muted-foreground block font-body">
                Today's Sessions
              </span>
              {sessionsLoading ? (
                <Skeleton className="h-6 w-8 mt-0.5" />
              ) : (
                <span className="text-xl font-display font-bold text-foreground">
                  {todaySessions?.length ?? 0}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          <CheckCircle2 size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            {sessionsLoading
              ? "—"
              : `${todaySessions?.length ?? 0} session${(todaySessions?.length ?? 0) !== 1 ? "s" : ""} completed today`}
          </span>
          <Flame size={13} className="text-accent ml-auto" />
          <span className="text-xs text-muted-foreground">
            {streakLoading ? "—" : `Best: ${bestStreak}`}
          </span>
        </div>
      </Card>

      {/* ── Tasks section ── */}
      <div data-ocid="dashboard.tasks_section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-accent" />
            <h2 className="text-sm font-display font-semibold text-foreground">
              My Tasks
            </h2>
            {tasks && tasks.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {tasks.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant={showCreateForm ? "secondary" : "default"}
            onClick={() => setShowCreateForm((v) => !v)}
            data-ocid="dashboard.add_task_button"
            className="h-7 px-2.5 text-xs"
          >
            <Plus size={12} className="mr-1" />
            {showCreateForm ? "Cancel" : "Add Task"}
          </Button>
        </div>

        {/* Inline create form */}
        {showCreateForm && (
          <div className="mb-3">
            <CreateTaskForm onClose={() => setShowCreateForm(false)} />
          </div>
        )}

        {/* Task list */}
        {tasksLoading ? (
          <div
            className="space-y-2"
            data-ocid="dashboard.tasks_section.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <TaskCard key={String(task.id)} task={task} index={i + 1} />
            ))}
          </div>
        ) : (
          <Card
            className="p-6 text-center bg-card border-border border-dashed"
            data-ocid="dashboard.tasks_section.empty_state"
          >
            <div className="text-3xl mb-2" role="img" aria-label="clipboard">
              📋
            </div>
            <p className="font-display font-semibold text-foreground text-sm">
              No tasks yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Create your first task to begin a focus session.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
              data-ocid="dashboard.tasks_section.empty_state_cta"
            >
              <Plus size={12} className="mr-1" /> Create First Task
            </Button>
          </Card>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="text-center pt-2 pb-1">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
