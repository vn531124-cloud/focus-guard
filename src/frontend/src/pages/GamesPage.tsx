import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Brain, Wind, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type GameId = "breathing" | "tap" | "memory";

const GAMES = [
  {
    id: "breathing" as GameId,
    title: "Guided Breathing",
    desc: "5 deep breaths to recenter",
    icon: Wind,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "5 breaths",
  },
  {
    id: "tap" as GameId,
    title: "Tap Challenge",
    desc: "Test your reaction speed",
    icon: Zap,
    color: "text-accent",
    bg: "bg-accent/10",
    badge: "30s",
  },
  {
    id: "memory" as GameId,
    title: "Memory Match",
    desc: "Train your concentration",
    icon: Brain,
    color: "text-accent",
    bg: "bg-accent/10",
    badge: "4x4",
  },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  return (
    <div className="px-4 py-5 space-y-5" data-ocid="games.page">
      {activeGame ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 -ml-1"
            onClick={() => setActiveGame(null)}
            data-ocid="games.back_button"
          >
            <ArrowLeft size={14} /> Back to Games
          </Button>
          <GameRenderer game={activeGame} onExit={() => setActiveGame(null)} />
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Micro-Break Games
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Refresh your mind, boost focus.
            </p>
          </div>
          <div className="space-y-3">
            {GAMES.map((game, i) => (
              <button
                key={game.id}
                type="button"
                className="w-full p-4 flex items-center gap-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors duration-200 cursor-pointer text-left"
                onClick={() => setActiveGame(game.id)}
                data-ocid={`games.game_card.${i + 1}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${game.bg} flex items-center justify-center shrink-0`}
                >
                  <game.icon size={22} className={game.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground">
                    {game.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {game.desc}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {game.badge}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GameRenderer({ game, onExit }: { game: GameId; onExit: () => void }) {
  switch (game) {
    case "breathing":
      return <BreathingGame onExit={onExit} />;
    case "tap":
      return <TapChallengeGame onExit={onExit} />;
    case "memory":
      return <MemoryMatchGame onExit={onExit} />;
  }
}

// -- Breathing Game -------------------------------------------------------------

const TOTAL_BREATHS = 5;

function BreathingGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"idle" | "inhale" | "exhale">("idle");
  const [breath, setBreath] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const runExhale = useCallback((currentBreath: number) => {
    setPhase("exhale");
    timeoutRef.current = setTimeout(() => {
      const next = currentBreath + 1;
      if (next >= TOTAL_BREATHS) {
        setDone(true);
        setPhase("idle");
      } else {
        setBreath(next);
        setPhase("inhale");
        timeoutRef.current = setTimeout(() => runExhale(next), 4000);
      }
    }, 4000);
  }, []);

  function start() {
    clearTimer();
    setDone(false);
    setBreath(0);
    setPhase("inhale");
    timeoutRef.current = setTimeout(() => runExhale(0), 4000);
  }

  function reset() {
    clearTimer();
    setDone(false);
    setBreath(0);
    setPhase("idle");
  }

  useEffect(() => () => clearTimer(), [clearTimer]);

  const circleSize =
    phase === "inhale"
      ? "w-36 h-36"
      : phase === "exhale"
        ? "w-20 h-20"
        : "w-28 h-28";
  const breathDisplay = Math.min(breath + 1, TOTAL_BREATHS);

  return (
    <Card
      className="p-6 bg-card border-border flex flex-col items-center gap-6"
      data-ocid="games.breathing_game"
    >
      <div className="text-center">
        <h2 className="font-display font-bold text-foreground text-lg">
          Guided Breathing
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Breathe slowly and deeply
        </p>
      </div>

      <div className="flex items-center justify-center w-48 h-48">
        <div
          className={`rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center ${circleSize}`}
          style={{
            transition:
              phase === "inhale" || phase === "exhale"
                ? "width 4000ms ease-in-out, height 4000ms ease-in-out"
                : "width 300ms, height 300ms",
          }}
        >
          {phase !== "idle" && (
            <span className="text-sm font-display font-semibold text-primary">
              {phase === "inhale" ? "Inhale" : "Exhale"}
            </span>
          )}
        </div>
      </div>

      <div className="text-center">
        {done ? (
          <>
            <p className="text-2xl mb-1">&#x1F33F;</p>
            <p className="font-display font-semibold text-foreground text-lg">
              Beautifully done
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your mind is calmer now. You&apos;ve got this.
            </p>
          </>
        ) : phase === "idle" ? (
          <p className="text-sm text-muted-foreground">
            Find a comfortable position and begin
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Breath{" "}
            <span className="text-foreground font-semibold">
              {breathDisplay}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-semibold">
              {TOTAL_BREATHS}
            </span>
          </p>
        )}
      </div>

      {done ? (
        <div className="flex gap-2" data-ocid="games.breathing_done">
          <Button
            variant="outline"
            onClick={reset}
            data-ocid="games.breathing_reset_button"
          >
            Reset
          </Button>
          <Button onClick={onExit} data-ocid="games.breathing_exit_button">
            Done
          </Button>
        </div>
      ) : (
        <Button
          onClick={phase === "idle" ? start : reset}
          data-ocid="games.breathing_toggle_button"
        >
          {phase === "idle" ? "Start Breathing" : "Stop"}
        </Button>
      )}
    </Card>
  );
}

// -- Tap Challenge Game --------------------------------------------------------

const TAP_DURATION = 30;
const TARGET_MIN_SIZE = 30;
const TARGET_START_SIZE = 80;

function getStarRating(score: number): number {
  if (score >= 40) return 5;
  if (score >= 30) return 4;
  if (score >= 20) return 3;
  if (score >= 10) return 2;
  return 1;
}

function randomPos(targetSize: number) {
  const containerSize = 300;
  const max = containerSize - targetSize;
  return {
    x: Math.floor(Math.random() * max),
    y: Math.floor(Math.random() * max),
  };
}

function TapChallengeGame({ onExit }: { onExit: () => void }) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">(
    "idle",
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TAP_DURATION);
  const [targetSize, setTargetSize] = useState(TARGET_START_SIZE);
  const [pos, setPos] = useState({ x: 110, y: 110 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  function startGame() {
    stopTimer();
    setScore(0);
    setTimeLeft(TAP_DURATION);
    setTargetSize(TARGET_START_SIZE);
    setPos(randomPos(TARGET_START_SIZE));
    setGameState("playing");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setGameState("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleTap() {
    setScore((s) => s + 1);
    setTargetSize((sz) => {
      const next = Math.max(TARGET_MIN_SIZE, Math.floor(sz * 0.9));
      setPos(randomPos(next));
      return next;
    });
  }

  useEffect(() => () => stopTimer(), [stopTimer]);

  const stars = getStarRating(score);
  const starLabel =
    stars === 5
      ? "Incredible! Lightning fast!"
      : stars === 4
        ? "Great reflexes!"
        : stars === 3
          ? "Good work!"
          : stars === 2
            ? "Keep practising!"
            : "You'll do better next time!";

  return (
    <Card
      className="p-6 bg-card border-border flex flex-col items-center gap-5"
      data-ocid="games.tap_game"
    >
      <h2 className="font-display font-bold text-foreground text-lg">
        Tap Challenge
      </h2>

      {gameState === "idle" && (
        <>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Tap the target as many times as you can in 30 seconds. Each hit
            makes it smaller!
          </p>
          <Button onClick={startGame} data-ocid="games.tap_start_button">
            Start
          </Button>
        </>
      )}

      {gameState === "playing" && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex gap-4">
            <Badge variant="secondary">{timeLeft}s left</Badge>
            <Badge variant="outline">Score: {score}</Badge>
          </div>
          <div
            className="relative bg-muted/30 rounded-xl border border-border overflow-hidden"
            style={{ width: 300, height: 300 }}
            data-ocid="games.tap_arena"
          >
            <button
              type="button"
              className="absolute rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold transition-[width,height,left,top] duration-100 active:scale-90 cursor-pointer"
              style={{
                width: targetSize,
                height: targetSize,
                left: pos.x,
                top: pos.y,
                fontSize: Math.max(10, targetSize * 0.25),
              }}
              onClick={handleTap}
              aria-label="Tap target"
              data-ocid="games.tap_target_button"
            >
              TAP
            </button>
          </div>
        </div>
      )}

      {gameState === "done" && (
        <div
          className="flex flex-col items-center gap-3 py-2 w-full"
          data-ocid="games.tap_result"
        >
          <p className="text-4xl font-mono font-bold text-primary">{score}</p>
          <p className="text-sm text-muted-foreground">taps in 30 seconds</p>
          <div
            className="flex gap-0.5 text-2xl"
            aria-label={`${stars} out of 5 stars`}
          >
            {(["1", "2", "3", "4", "5"] as const).map((k, i) => (
              <span
                key={k}
                className={
                  i < stars ? "text-accent" : "text-muted-foreground opacity-30"
                }
              >
                &#9733;
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{starLabel}</p>
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              onClick={startGame}
              data-ocid="games.tap_retry_button"
            >
              Try Again
            </Button>
            <Button onClick={onExit} data-ocid="games.tap_done_button">
              Done
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// -- Memory Match Game --------------------------------------------------------

const EMOJI_RAW = [
  "\u{1F98B}",
  "\u{1F338}",
  "\u{1F525}",
  "\u26A1",
  "\u{1F3AF}",
  "\u{1F319}",
  "\u{1F48E}",
  "\u{1F680}",
];

interface MemCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): MemCard[] {
  return [...EMOJI_RAW, ...EMOJI_RAW]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MemoryMatchGame({ onExit }: { onExit: () => void }) {
  const [deck, setDeck] = useState<MemCard[]>(() => buildDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  function ensureStarted() {
    if (!started) {
      setStarted(true);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
  }

  useEffect(() => () => stopTimer(), [stopTimer]);

  function handleFlip(id: number) {
    if (locked || done) return;
    const card = deck[id];
    if (card.flipped || card.matched || selected.includes(id)) return;

    ensureStarted();

    const newSelected = [...selected, id];
    setDeck((d) => d.map((c) => (c.id === id ? { ...c, flipped: true } : c)));

    if (newSelected.length === 2) {
      setSelected([]);
      setLocked(true);
      const [a, b] = newSelected;
      setTimeout(() => {
        setDeck((d) => {
          const match = d[a].emoji === d[b].emoji;
          const updated = d.map((c) =>
            c.id === a || c.id === b
              ? match
                ? { ...c, matched: true }
                : { ...c, flipped: false }
              : c,
          );
          if (match && updated.every((c) => c.matched)) {
            stopTimer();
            setDone(true);
          }
          return updated;
        });
        setLocked(false);
      }, 1000);
    } else {
      setSelected(newSelected);
    }
  }

  function reset() {
    stopTimer();
    setDeck(buildDeck());
    setSelected([]);
    setLocked(false);
    setElapsed(0);
    setStarted(false);
    setDone(false);
  }

  const matchedCount = deck.filter((c) => c.matched).length / 2;

  return (
    <Card className="p-4 bg-card border-border" data-ocid="games.memory_game">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-foreground text-lg">
          Memory Match
        </h2>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="font-mono text-xs">
            {formatTime(elapsed)}
          </Badge>
          <Badge variant="secondary">
            {matchedCount}/{EMOJI_RAW.length}
          </Badge>
        </div>
      </div>

      {done ? (
        <div
          className="flex flex-col items-center gap-3 py-6"
          data-ocid="games.memory_win"
        >
          <p className="text-3xl">&#x1F389;</p>
          <p className="font-display font-bold text-foreground text-lg">
            Completed!
          </p>
          <p className="text-sm text-muted-foreground">
            Time:{" "}
            <span className="text-foreground font-semibold">
              {formatTime(elapsed)}
            </span>
          </p>
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              onClick={reset}
              data-ocid="games.memory_retry_button"
            >
              Play Again
            </Button>
            <Button onClick={onExit} data-ocid="games.memory_done_button">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {deck.map((card, i) => (
              <button
                key={card.id}
                type="button"
                className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-all duration-200 select-none ${
                  card.matched
                    ? "bg-primary/15 border border-primary/30 scale-95 cursor-default"
                    : card.flipped
                      ? "bg-secondary border border-border"
                      : "bg-muted hover:bg-secondary/70 border border-transparent hover:border-border cursor-pointer active:scale-95"
                }`}
                onClick={() => handleFlip(card.id)}
                data-ocid={`games.memory_card.${i + 1}`}
                aria-label={
                  card.flipped || card.matched ? card.emoji : "Hidden card"
                }
                disabled={card.matched}
              >
                {card.flipped || card.matched ? card.emoji : ""}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            {!started ? "Tap a card to begin" : "Match all pairs to finish"}
          </p>
        </>
      )}
    </Card>
  );
}
