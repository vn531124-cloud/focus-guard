import List "mo:core/List";
import Types "../types/tasks";
import TasksLib "../lib/tasks";
import Time "mo:core/Time";

mixin (
  tasks : List.List<Types.Task>,
  sessions : List.List<Types.FocusSession>,
  nextTaskId : { var val : Nat },
  streak : { var val : Types.StreakData },
) {

  public func createTask(action : Text, time : Nat, rule : Text) : async Types.Task {
    nextTaskId.val += 1;
    TasksLib.createTask(tasks, nextTaskId.val, action, time, rule);
  };

  public query func listTasks() : async [Types.Task] {
    TasksLib.listTasks(tasks);
  };

  public func deleteTask(id : Nat) : async Bool {
    TasksLib.deleteTask(tasks, id);
  };

  public func recordFocusSession(taskId : Nat) : async Types.FocusSession {
    let now = Time.now();
    TasksLib.recordSession(sessions, taskId, now);
  };

  public query func listFocusSessions() : async [Types.FocusSession] {
    TasksLib.listSessions(sessions);
  };

  public query func getStreak() : async Types.StreakData {
    TasksLib.getStreak(streak.val);
  };

  public func updateStreak(currentStreak : Nat, bestStreak : Nat, lastFocusDate : Text) : async Types.StreakData {
    let updated = TasksLib.updateStreak(streak.val, currentStreak, bestStreak, lastFocusDate);
    streak.val := updated;
    updated;
  };
};
