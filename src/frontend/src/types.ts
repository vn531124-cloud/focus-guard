export interface Task {
  id: bigint;
  action: string;
  time: bigint;
  rule: string;
}

export interface FocusSession {
  taskId: bigint;
  completedAt: bigint;
}

export interface StreakData {
  currentStreak: bigint;
  bestStreak: bigint;
  lastFocusDate: string;
}
