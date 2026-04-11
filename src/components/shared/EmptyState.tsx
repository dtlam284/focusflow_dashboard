import React from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      {description ? (
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}