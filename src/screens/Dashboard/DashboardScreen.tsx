import {
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Link2,
  NotebookPen,
  ListTodo,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector } from "@/app/store/hooks";

import {
  selectCompletedTaskCount,
  selectPendingTaskCount,
  selectTotalTaskCount,
  selectUnfinishedTaskCount,
} from "@/features/tasks/store/selectors/taskSelectors";
import { selectPinnedNotesCount } from "@/features/notes/store/selectors/noteSelectors";
import { selectLinksCount } from "@/features/links/store/selectors/linkSelectors";

//#region types
type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};
//#endregion types

//#region local component
function SummaryCard({
  title,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-semibold tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="shrink-0 rounded-xl bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      </div>
    </article>
  );
}
//#endregion local component

//#region component
export function DashboardScreen() {
  //#region hooks
  const { user } = useAuth();
  //#endregion hooks

  //#region selectors
  const totalTasks = useAppSelector(selectTotalTaskCount);
  const completedTasks = useAppSelector(selectCompletedTaskCount);
  const pendingTasks = useAppSelector(selectPendingTaskCount);
  const unfinishedTasks = useAppSelector(selectUnfinishedTaskCount);
  const pinnedNotes = useAppSelector(selectPinnedNotesCount);
  const savedLinks = useAppSelector(selectLinksCount);
  //#endregion selectors

  //#region render
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user ? `, ${user.firstName}` : ""}`}
        description="A quick overview of the current work, saved notes, and useful resources."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Tasks"
          value={totalTasks}
          description="All tasks currently saved in the workspace."
          icon={<ListTodo className="h-5 w-5" />}
        />

        <SummaryCard
          title="Completed Tasks"
          value={completedTasks}
          description="Tasks already marked as done."
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <SummaryCard
          title="Pending Tasks"
          value={pendingTasks}
          description="Tasks that still need to be completed."
          icon={<Clock3 className="h-5 w-5" />}
        />

        <SummaryCard
          title="Unfinished Tasks"
          value={unfinishedTasks}
          description="Tasks that are overdue and not completed yet."
          icon={<LayoutDashboard className="h-5 w-5" />}
        />

        <SummaryCard
          title="Pinned Notes"
          value={pinnedNotes}
          description="Important notes that are pinned for quick access."
          icon={<NotebookPen className="h-5 w-5" />}
        />

        <SummaryCard
          title="Saved Links"
          value={savedLinks}
          description="Useful resources that are saved in the app."
          icon={<Link2 className="h-5 w-5" />}
        />
      </section>
    </div>
  );
  //#endregion render
}
//#endregion component
