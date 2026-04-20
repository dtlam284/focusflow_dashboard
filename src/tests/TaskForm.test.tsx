import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "@/features/tasks/components/TaskForm";

//#region mock
vi.mock("@/contexts/I18nContext", () => ({
  useI18n: () => ({
    t: (value: string) => value,
  }),
}));
//#endregion mock

//#region setup
describe("TaskForm", () => {
  it("does not submit when title is missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /add task/i,
      }),
    );

    expect(onSubmit).not.toHaveBeenCalled();

    expect(
      await screen.findByText("Title must be at least 3 characters."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please select a due date."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please select a time."),
    ).toBeInTheDocument();
  });
});
//#endregion setup
