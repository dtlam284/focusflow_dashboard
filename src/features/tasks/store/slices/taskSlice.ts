import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ITask, ITaskFilters, ITasksState } from "../../types/taskTypes";

const initialState: ITasksState = {
  items: [],
  filters: {
    status: "all",
    priority: "all",
    keyword: "",
  },
};

type UpdateTaskPayload = {
  id: string;
  changes: Partial<Omit<ITask, "id" | "createdAt">>;
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<ITask>) {
      state.items.unshift(action.payload);
    },

    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { id, changes } = action.payload;

      state.items = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    toggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);

      if (!task) return;

      task.status = task.status === "done" ? "todo" : "done";
      task.updatedAt = new Date().toISOString();
    },

    setTaskFilters(state, action: PayloadAction<Partial<ITaskFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    resetTaskFilters(state) {
      state.filters = initialState.filters;
    },

    hydrateTasks(state, action: PayloadAction<ITask[]>) {
      state.items = action.payload;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  setTaskFilters,
  resetTaskFilters,
  hydrateTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
