import * as React from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/utils";

import { TaskCard } from "./TaskCard";
import type { ITask, ITaskFilters } from "../types/taskTypes";

export interface TaskListProps {
  tasks: ITask[];
  filters?: ITaskFilters;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function TaskList({
  tasks,
  filters,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyAction,
  className,
}: TaskListProps) {
  const { t } = useI18n();

  const hasActiveFilters = Boolean(
    filters &&
      (
        filters.status !== "all" ||
        filters.priority !== "all" ||
        filters.keyword.trim().length > 0
      ),
  );

  if (tasks.length === 0) {
    return (
      <EmptyState
        className={cn("min-h-[260px]", className)}
        title={
          hasActiveFilters
            ? t("No matching tasks")
            : t("No tasks yet")
        }
        description={
          hasActiveFilters
            ? t("Try changing the current filters or search keyword.")
            : t("Create your first task to start organizing your work.")
        }
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {tasks.map((task) => (
        <TaskCard
          key={`${task.id}-${task.updatedAt}`}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
