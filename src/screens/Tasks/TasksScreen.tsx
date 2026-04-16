import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatCard } from "@/components/shared/StatCard";
import { useI18n } from "@/contexts/I18nContext";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskFilterBar } from "@/features/tasks/components/TaskFilterBar";
import { TaskList } from "@/features/tasks/components/TaskList";
import {
  addTask,
  deleteTask,
  resetTaskFilters,
  setTaskFilters,
  toggleTaskStatus,
  updateTask,
} from "@/features/tasks/store/slices/taskSlice";
import {
  selectCompletedTaskCount,
  selectFilteredTasks,
  selectPendingTaskCount,
  selectTaskFilters,
  selectTaskItems,
  selectUnfinishedTaskCount,
} from "@/features/tasks/store/selectors/taskSelectors";

import type { ITask, ITaskFilters } from "@/features/tasks/types/taskTypes";
import type { TaskFormValues } from "@/features/tasks/schemas/taskSchema";

export function TasksScreen() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTaskItems);
  const filters = useAppSelector(selectTaskFilters);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const completedCount = useAppSelector(selectCompletedTaskCount);
  const pendingCount = useAppSelector(selectPendingTaskCount);
  const unfinishedCount = useAppSelector(selectUnfinishedTaskCount);

  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [taskPendingDelete, setTaskPendingDelete] = React.useState<ITask | null>(null);

  const editingTask = tasks.find((task) => task.id === editingTaskId) ?? null;
  const totalCount = tasks.length;

  const initialFormValues = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? "",
        priority: editingTask.priority === "all" ? "medium" : editingTask.priority,
        dueDate: editingTask.dueDate ?? "",
        dueTime: editingTask.dueTime ?? "",
      }
    : undefined;

  const handleCreateTask = (values: TaskFormValues) => {
    const now = new Date().toISOString();

    dispatch(
      addTask({
        id: crypto.randomUUID(),
        title: values.title,
        description: values.description?.trim() || undefined,
        priority: values.priority,
        dueDate: values.dueDate.trim(),
        dueTime: values.dueTime?.trim() || undefined,
        status: "todo",
        createdAt: now,
        updatedAt: now,
      }),
    );
  };

  const handleUpdateTask = (values: TaskFormValues) => {
    if (!editingTask) return;

    dispatch(
      updateTask({
        id: editingTask.id,
        changes: {
          title: values.title,
          description: values.description?.trim() || undefined,
          priority: values.priority,
          dueDate: values.dueDate.trim(),
          dueTime: values.dueTime?.trim() || undefined,
        },
      }),
    );

    setEditingTaskId(null);
  };

  const handleSubmitTask = async (values: TaskFormValues) => {
    if (editingTask) {
      handleUpdateTask(values);
      return;
    }

    handleCreateTask(values);
  };

  const handleStartEdit = (task: ITask) => {
    setEditingTaskId(task.id);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleToggleStatus = (taskId: string) => {
    dispatch(toggleTaskStatus(taskId));
  };

  const handleRequestDelete = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null;
    setTaskPendingDelete(task);
  };

  const handleConfirmDelete = () => {
    if (!taskPendingDelete) return;

    dispatch(deleteTask(taskPendingDelete.id));

    if (editingTaskId === taskPendingDelete.id) {
      setEditingTaskId(null);
    }

    setTaskPendingDelete(null);
  };

  const handleStatusChange = (status: ITaskFilters["status"]) => {
    dispatch(setTaskFilters({ status }));
  };

  const handlePriorityChange = (priority: ITaskFilters["priority"]) => {
    dispatch(setTaskFilters({ priority }));
  };

  const handleKeywordChange = (keyword: string) => {
    dispatch(setTaskFilters({ keyword }));
  };

  const handleResetFilters = () => {
    dispatch(resetTaskFilters());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your tasks with a clean and focused workflow."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("Total tasks")}
          value={totalCount}
          icon={<ListTodo className="h-4 w-4" />}
        />
        <StatCard
          title={t("Pending")}
          value={pendingCount}
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard
          title={t("Completed")}
          value={completedCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          title={t("Unfinished")}
          value={unfinishedCount}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <TaskForm
          key={editingTask ? editingTask.id : "create"}
          mode={editingTask ? "edit" : "create"}
          initialValues={initialFormValues}
          onSubmit={handleSubmitTask}
          onCancelEdit={editingTask ? handleCancelEdit : undefined}
        />

        <div className="space-y-4">
          <TaskFilterBar
            filters={filters}
            visibleCount={filteredTasks.length}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onKeywordChange={handleKeywordChange}
            onReset={handleResetFilters}
          />

          <TaskList
            tasks={filteredTasks}
            filters={filters}
            onEdit={handleStartEdit}
            onDelete={handleRequestDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        title={t("Delete task")}
        description={
          taskPendingDelete
            ? t('Are you sure you want to delete "{title}"?', {
                title: taskPendingDelete.title,
              })
            : t("Are you sure you want to delete this task?")
        }
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        onOpenChange={(open) => {
          if (!open) setTaskPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
