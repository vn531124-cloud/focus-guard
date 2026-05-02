import List "mo:core/List";
import Types "types/tasks";
import TasksApi "mixins/tasks-api";

actor {
  let tasks = List.empty<Types.Task>();
  let sessions = List.empty<Types.FocusSession>();
  let nextTaskIdRef = { var val : Nat = 0 };
  let streakRef = { var val : Types.StreakData = {
    currentStreak = 0;
    bestStreak = 0;
    lastFocusDate = "";
  }};

  include TasksApi(tasks, sessions, nextTaskIdRef, streakRef);
};
