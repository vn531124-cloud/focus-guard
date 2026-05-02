import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    action: string;
    rule: string;
    time: bigint;
}
export interface StreakData {
    lastFocusDate: string;
    bestStreak: bigint;
    currentStreak: bigint;
}
export interface FocusSession {
    completedAt: bigint;
    taskId: bigint;
}
export interface backendInterface {
    createTask(action: string, time: bigint, rule: string): Promise<Task>;
    deleteTask(id: bigint): Promise<boolean>;
    getStreak(): Promise<StreakData>;
    listFocusSessions(): Promise<Array<FocusSession>>;
    listTasks(): Promise<Array<Task>>;
    recordFocusSession(taskId: bigint): Promise<FocusSession>;
    updateStreak(currentStreak: bigint, bestStreak: bigint, lastFocusDate: string): Promise<StreakData>;
}
