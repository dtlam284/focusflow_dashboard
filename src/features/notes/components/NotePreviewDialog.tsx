import { Edit3, Pin, Tag, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

import type { INote } from "../types/noteTypes";

//#region props
export interface INotePreviewDialogProps {
  note: INote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (note: INote) => void;
}
//endregion props

//#region ui maps
const categoryBadgeStyles: Record<INote["category"], string> = {
  work: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  personal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  idea: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  learning: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

const colorAccentStyles: Record<INote["color"], string> = {
  default: "before:bg-slate-300 dark:before:bg-slate-600",
  blue: "before:bg-blue-500 dark:before:bg-blue-400",
  green: "before:bg-emerald-500 dark:before:bg-emerald-400",
  yellow: "before:bg-amber-500 dark:before:bg-amber-400",
  rose: "before:bg-rose-500 dark:before:bg-rose-400",
  violet: "before:bg-violet-500 dark:before:bg-violet-400",
};
//#endregion ui maps

//#region helpers
const formatCategory = (category: INote["category"]) => {
  switch (category) {
    case "work":
      return "Work";
    case "personal":
      return "Personal";
    case "idea":
      return "Idea";
    case "learning":
      return "Learning";
    default:
      return "Other";
  }
};
//#endregion helpers

//#region component
export function NotePreviewDialog({
  note,
  open,
  onOpenChange,
  onEdit,
}: INotePreviewDialogProps) {
  if (!note) return null;

  //#region render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div
          className={cn(
            "relative before:absolute before:left-0 before:top-0 before:h-full before:w-1.5",
            colorAccentStyles[note.color],
          )}
        >
          <DialogHeader className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  categoryBadgeStyles[note.category],
                )}
              >
                <Tag className="h-3.5 w-3.5" />
                {formatCategory(note.category)}
              </span>

              {note.isPinned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  <Pin className="h-3.5 w-3.5" />
                  Pinned
                </span>
              ) : null}
            </div>

            <DialogTitle className="pt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {note.title}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Note preview
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
              {note.content}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Updated: {new Date(note.updatedAt).toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              {onEdit ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEdit(note);
                    onOpenChange(false);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              ) : null}

              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  //#endregion render
}
//#endregion component
