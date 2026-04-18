import { Pin } from "lucide-react";

import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/utils";

import { NoteCard } from "./NoteCard";
import { NoteForm } from "./NoteForm";
import type { INote } from "../types/noteTypes";

//#region props
export interface INotesPinnedSectionProps {
  notes: INote[];
  editingNoteId?: string | null;
  onEdit: (note: INote) => void;
  onSaveEdit: (values: any) => void;
  onCancelEdit: () => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onPreview: (note: INote) => void;
  className?: string;
}
//endregion props

//#region component
export function NotesPinnedSection({
  notes,
  editingNoteId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onTogglePin,
  onPreview,
  className,
}: INotesPinnedSectionProps) {
  const { t } = useI18n();

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Pin className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("Pinned notes")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("Your most important notes stay here for quick access.")}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) =>
          note.id === editingNoteId ? (
            <NoteForm
              key={`edit-${note.id}`}
              mode="edit"
              initialValues={{
                title: note.title,
                content: note.content,
                color: note.color,
                category: note.category,
              }}
              onSubmit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ) : (
            <NoteCard
              key={`${note.id}-${note.updatedAt}`}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onPreview={onPreview}
            />
          ),
        )}
      </div>
    </section>
  );
}
//#endregion component
