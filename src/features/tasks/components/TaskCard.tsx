import { CalendarDays, CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusChip } from "@/components/shared/StatusChip";
import { cn } from "@/utils";

import type { ITask } from "../types/taskTypes";

//#region props
export interface ITaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
}
//#endregion props

//#region ui maps
const taskStatusUi: Record<
  ITask["status"],
  { status: string; label: string }
> = {
  all: { status: "pending", label: "Unknown" },
  todo: { status: "pending", label: "To do" },
  done: { status: "completed", label: "Done" },
  unfinished: { status: "warning", label: "Unfinished" },
};

const priorityStyles: Record<string, string> = {
  low: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  medium:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400",
  high: "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400",
};
//#endregion ui maps

//#region helpers
const getTaskDeadline = (task: ITask) => {
  if (!task.dueDate) return null;

  const time = task.dueTime?.trim() || "23:59";
  return new Date(`${task.dueDate}T${time}:00`);
};

const getTaskEffectiveStatus = (task: ITask): ITask["status"] => {
  if (task.status === "done") return "done";

  const deadline = getTaskDeadline(task);
  if (!deadline || Number.isNaN(deadline.getTime())) return "todo";

  return deadline < new Date() ? "unfinished" : "todo";
};
//#endregion helpers

//#region component
export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}: ITaskCardProps) {

  //#region derived values
  const effectiveStatus = getTaskEffectiveStatus(task);
  const isDone = effectiveStatus === "done";
  const isUnfinished = effectiveStatus === "unfinished";
  //#endregion derived values

  //#region render
  return (
    <Card className="gap-0 overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="min-w-0 space-y-1">
          <h3
            className={cn(
              "line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100",
              isDone && "text-slate-500 line-through dark:text-slate-500",
            )}
          >
            {task.title}
          </h3>

          {task.description ? (
            <p
              className={cn(
                "line-clamp-3 text-sm text-slate-500 dark:text-slate-400",
                isDone && "text-slate-400 dark:text-slate-500",
              )}
            >
              {task.description}
            </p>
          ) : null}
        </div>

        <StatusChip
          status={taskStatusUi[effectiveStatus].status}
          label={taskStatusUi[effectiveStatus].label}
          className="shrink-0"
        />
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              priorityStyles[task.priority] ?? priorityStyles.medium,
            )}
          >
            {task.priority === "high"
              ? "High priority"
              : task.priority === "medium"
                ? "Medium priority"
                : "Low priority"}
          </span>
        </div>

        {task.dueDate ? (
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              Due: {task.dueDate}
              {task.dueTime ? ` ${task.dueTime}` : ""}
            </span>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button
          size="sm"
          variant={isDone ? "outline" : isUnfinished ? "destructive" : "default"}
          onClick={() => onToggleStatus(task.id)}
        >
          {isDone ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Reopen
            </>
          ) : isUnfinished ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Complete now
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </>
          )}
        </Button>

        <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>

        <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
  //#endregion render
}
//#endregion component
