import List "mo:core/List";
import Types "../types/tasks";

module {
  public func createTask(
    tasks : List.List<Types.Task>,
    nextId : Nat,
    action : Text,
    time : Nat,
    rule : Text,
  ) : Types.Task {
    let task : Types.Task = { id = nextId; action; time; rule };
    tasks.add(task);
    task;
  };

  public func listTasks(tasks : List.List<Types.Task>) : [Types.Task] {
    tasks.toArray();
  };

  public func deleteTask(tasks : List.List<Types.Task>, id : Nat) : Bool {
    let sizeBefore = tasks.size();
    let filtered = tasks.filter(func(t) { t.id != id });
    let found = filtered.size() < sizeBefore;
    tasks.clear();
    tasks.append(filtered);
    found;
  };

  public func recordSession(
    sessions : List.List<Types.FocusSession>,
    taskId : Nat,
    completedAt : Int,
  ) : Types.FocusSession {
    let session : Types.FocusSession = { taskId; completedAt };
    sessions.add(session);
    session;
  };

  public func listSessions(sessions : List.List<Types.FocusSession>) : [Types.FocusSession] {
    sessions.toArray();
  };

  public func getStreak(streak : Types.StreakData) : Types.StreakData {
    streak;
  };

  public func updateStreak(
    streak : Types.StreakData,
    currentStreak : Nat,
    bestStreak : Nat,
    lastFocusDate : Text,
  ) : Types.StreakData {
    { currentStreak; bestStreak; lastFocusDate };
  };
};
