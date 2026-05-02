module {
  public type Task = {
    id : Nat;
    action : Text;
    time : Nat;
    rule : Text;
  };

  public type FocusSession = {
    taskId : Nat;
    completedAt : Int;
  };

  public type StreakData = {
    currentStreak : Nat;
    bestStreak : Nat;
    lastFocusDate : Text;
  };
};
