import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateTask, useDeleteTask, useListTasks } from "@/hooks/useBackend";
import { Link } from "@tanstack/react-router";
import { ListTodo, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TaskFormState {
  action: string;
  time: string;
  rule: string;
}

const INITIAL_FORM: TaskFormState = { action: "", time: "25", rule: "" };

export default function TasksPage() {
  const { data: tasks, isLoading } = useListTasks();
  const { mutateAsync: createTask, isPending: creating } = useCreateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();

  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.action.trim()) {
      toast.error("Action is required");
      return;
    }
    const timeNum = Number.parseInt(form.time, 10);
    if (Number.isNaN(timeNum) || timeNum < 1) {
      toast.error("Enter a valid time (minutes)");
      return;
    }
    try {
      await createTask({
        action: form.action.trim(),
        time: BigInt(timeNum),
        rule: form.rule.trim(),
      });
      toast.success("Task added!");
      setForm(INITIAL_FORM);
    } catch {
      toast.error("Failed to add task");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteTask(id);
      toast.success("Task removed");
    } catch {
      toast.error("Failed to remove task");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  const orderedTasks = tasks ? [...tasks].reverse() : [];

  return (
    <div className="px-4 py-5 space-y-6" data-ocid="tasks.page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Build your focus queue.
        </p>
      </div>

      {/* Add task form — always visible */}
      <Card className="p-4 bg-card border-border" data-ocid="tasks.add_form">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          New Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label
              htmlFor="task-action"
              className="text-xs text-muted-foreground"
            >
              Action
            </Label>
            <Input
              id="task-action"
              placeholder="What to do..."
              value={form.action}
              onChange={(e) =>
                setForm((s) => ({ ...s, action: e.target.value }))
              }
              data-ocid="tasks.action_input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label
                htmlFor="task-time"
                className="text-xs text-muted-foreground"
              >
                Time (min)
              </Label>
              <Input
                id="task-time"
                type="number"
                min="1"
                max="180"
                placeholder="25"
                value={form.time}
                onChange={(e) =>
                  setForm((s) => ({ ...s, time: e.target.value }))
                }
                data-ocid="tasks.time_input"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="task-rule"
                className="text-xs text-muted-foreground"
              >
                Rule
              </Label>
              <Input
                id="task-rule"
                placeholder="When/how often..."
                value={form.rule}
                onChange={(e) =>
                  setForm((s) => ({ ...s, rule: e.target.value }))
                }
                data-ocid="tasks.rule_input"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={creating}
            className="w-full"
            data-ocid="tasks.submit_button"
          >
            {creating ? "Adding…" : "Add Task"}
          </Button>
        </form>
      </Card>

      {/* Task list */}
      <div className="space-y-1" data-ocid="tasks.list">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Your Tasks
        </h2>

        {isLoading ? (
          <div className="space-y-2" data-ocid="tasks.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : orderedTasks.length > 0 ? (
          <div className="space-y-2">
            {orderedTasks.map((task, i) => (
              <Card
                key={String(task.id)}
                className="p-3 bg-card border-border"
                data-ocid={`tasks.item.${i + 1}`}
              >
                {/* Confirm delete overlay */}
                {confirmDeleteId === task.id ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">Delete this task?</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                        data-ocid={`tasks.confirm_button.${i + 1}`}
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteId(null)}
                        data-ocid={`tasks.cancel_button.${i + 1}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-foreground text-sm leading-snug">
                        {task.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
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
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        data-ocid={`tasks.focus_button.${i + 1}`}
                      >
                        <Link to="/focus" search={{ taskId: String(task.id) }}>
                          <Play size={12} />
                          Focus
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmDeleteId(task.id)}
                        aria-label="Delete task"
                        data-ocid={`tasks.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card
            className="p-8 text-center bg-card border-border"
            data-ocid="tasks.empty_state"
          >
            <ListTodo
              size={40}
              className="mx-auto text-muted-foreground mb-3"
              role="img"
              aria-label="No tasks"
            />
            <p className="font-display font-semibold text-foreground text-sm">
              No tasks yet — let's change that!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first task above and start building momentum.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
