import { SectionCard } from '@/components/shared/SectionCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useI18n } from '@/contexts/I18nContext'

import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'

//#region props
interface ITaskEditorDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<TaskFormValues>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TaskFormValues) => void | Promise<void>
}
//#endregion props

//#region component
export function TaskEditorDialog({
  open,
  mode,
  initialValues,
  onOpenChange,
  onSubmit,
}: ITaskEditorDialogProps) {
  //#region hooks
  const { t } = useI18n()
  const isEditMode = mode === 'edit'
  //#endregion hooks

  //#region handlers
  const handleSubmit = async (values: TaskFormValues) => {
    await onSubmit(values)
    onOpenChange(false)
  }
  //#endregion handlers

  //#region render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit task') : t('Create a new task')}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('Update the selected task details.')
              : t('Add a task to keep your work organized.')}
          </DialogDescription>
        </DialogHeader>

        <SectionCard className="border-0 bg-transparent p-0 shadow-none">
          <TaskForm
            key={isEditMode ? 'edit-task-form' : 'create-task-form'}
            mode={mode}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancelEdit={() => onOpenChange(false)}
          />
        </SectionCard>
      </DialogContent>
    </Dialog>
  )
  //#endregion render
}
//#endregion component
