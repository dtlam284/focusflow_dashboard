import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { SectionCard } from '@/components/shared/SectionCard'
import { useI18n } from '@/contexts/I18nContext'

import { noteFormSchema, type NoteFormValues } from '../schemas/noteSchema'

//#region props
export interface INoteFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<NoteFormValues>
  onSubmit: (values: NoteFormValues) => void | Promise<void>
  onCancelEdit?: () => void
  isSubmitting?: boolean
}
//#endregion props

//#region constants
const EMPTY_VALUES: NoteFormValues = {
  title: '',
  content: '',
  color: 'default',
  category: 'other',
}
//#endregion constants

//#region component
export function NoteForm({
  mode,
  initialValues,
  onSubmit,
  onCancelEdit,
  isSubmitting = false,
}: INoteFormProps) {
  const { t } = useI18n()

  //#region form setup
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      ...EMPTY_VALUES,
      ...initialValues,
    },
  })
  //#endregion form setup

  //#region effects
  React.useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      ...initialValues,
    })
  }, [initialValues, reset])
  //#endregion effects

  //#region derived values
  const isEditMode = mode === 'edit'
  const submitting = isSubmitting || isFormSubmitting
  //#endregion derived values

  //#region handlers
  const submitHandler = async (values: NoteFormValues) => {
    await onSubmit(values)

    if (!isEditMode) {
      reset(EMPTY_VALUES)
    }
  }
  //#endregion handlers

  //#region render
  return (
    <SectionCard
      title={isEditMode ? t('Edit note') : t('Create a new note')}
      description={
        isEditMode
          ? t('')
          : t('')
      }
    >
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <FormField
          label={t('Title')}
          htmlFor="note-title"
          required
          hint={t('')}
        >
          <Input
            id="note-title"
            placeholder={t('Enter note title')}
            aria-invalid={errors.title ? 'true' : 'false'}
            {...register('title')}
          />
          {errors.title ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.title.message}</p>
          ) : null}
        </FormField>

        <FormField
          label={t('Content')}
          htmlFor="note-content"
          required
          hint={t('')}
        >
          <Textarea
            id="note-content"
            placeholder={t('Write your note')}
            className="h-28 resize-none overflow-y-auto"
            aria-invalid={errors.content ? 'true' : 'false'}
            {...register('content')}
          />
          {errors.content ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.content.message}</p>
          ) : null}
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={t('Color')} required hint={t('')}>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={errors.color ? 'true' : 'false'}>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.color ? (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.color.message}</p>
            ) : null}
          </FormField>

          <FormField label={t('Category')} required hint={t('')}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={errors.category ? 'true' : 'false'}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category ? (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.category.message}</p>
            ) : null}
          </FormField>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button type="submit" isLoading={submitting}>
            {isEditMode ? (
              <>
                <Save className="h-4 w-4" />
                {t('Save changes')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t('Add note')}
              </>
            )}
          </Button>

          {isEditMode && onCancelEdit ? (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
              {t('Cancel')}
            </Button>
          ) : null}
        </div>
      </form>
    </SectionCard>
  )
  //#endregion render
}
//#endregion component
