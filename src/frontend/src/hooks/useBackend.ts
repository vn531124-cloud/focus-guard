import { createActor } from "@/backend";
import type { FocusSession, StreakData, Task } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useListTasks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<
    Task,
    Error,
    { action: string; time: bigint; rule: string }
  >({
    mutationFn: async ({ action, time, rule }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createTask(action, time, rule);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useListFocusSessions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FocusSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFocusSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordFocusSession() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<FocusSession, Error, bigint>({
    mutationFn: async (taskId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.recordFocusSession(taskId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

export function useGetStreak() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StreakData>({
    queryKey: ["streak"],
    queryFn: async () => {
      if (!actor)
        return { currentStreak: 0n, bestStreak: 0n, lastFocusDate: "" };
      return actor.getStreak();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStreak() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<
    StreakData,
    Error,
    { currentStreak: bigint; bestStreak: bigint; lastFocusDate: string }
  >({
    mutationFn: async ({ currentStreak, bestStreak, lastFocusDate }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateStreak(currentStreak, bestStreak, lastFocusDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streak"] }),
  });
}
