import type { RootState } from "@/app/store/store";
import type { ITask, TaskStatus } from "../../types/taskTypes";

//#region selectors
export const selectTaskState = (state: RootState) => state.tasks;
export const selectTaskItems = (state: RootState) => state.tasks.items;
export const selectTaskFilters = (state: RootState) => state.tasks.filters;
//#endregion selectors

//#region based helpers
const getTaskDeadline = (task: ITask) => {
  if (!task.dueDate) return null;

  const time = task.dueTime?.trim() || "23:59";
  return new Date(`${task.dueDate}T${time}:00`);
};

export const getTaskEffectiveStatus = (task: ITask): TaskStatus => {
  if (task.status === "done") return "done";

  const deadline = getTaskDeadline(task);
  if (!deadline || Number.isNaN(deadline.getTime())) return "todo";

  return deadline < new Date() ? "unfinished" : "todo";
};
//#endregion based helpers

//#region filtered selectors
export const selectFilteredTasks = (state: RootState): ITask[] => {
  const { items, filters } = state.tasks;
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((task) => {
    const effectiveStatus = getTaskEffectiveStatus(task);

    const matchesStatus =
      filters.status === "all" || effectiveStatus === filters.status;

    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;

    const matchesKeyword =
      keyword.length === 0 ||
      task.title.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword);

    return matchesStatus && matchesPriority && matchesKeyword;
  });
};
//#endregion filtered selectors

//#region metrics selectors
export const selectTotalTaskCount = (state: RootState) =>
  state.tasks.items.length;

export const selectCompletedTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => getTaskEffectiveStatus(task) === "done").length;

export const selectPendingTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => getTaskEffectiveStatus(task) !== "done").length;

export const selectUnfinishedTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => getTaskEffectiveStatus(task) === "unfinished").length;
//#endregion metrics selectors
