import * as React from 'react'
import { CalendarDays, Check, Clock3, Eye, FileText, PencilLine, Tag, X } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription,  SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { addTaskActivity } from '../store/slices/taskActivitySlice'
import { closeTaskDetail } from '../store/slices/taskDetailSlice'
import {
    attachLinkToTask,
    attachNoteToTask,
    dismissSuggestion,
} from '../store/slices/taskRelationsSlice'
import { updateTask } from '../store/slices/taskSlice'
import {
    selectAttachedLinksByTaskId,
    selectAttachedNotesByTaskId,
    selectSuggestedLinksByTaskId,
    selectSuggestedNotesByTaskId,
} from '../store/selectors/taskRelationsSelectors'
import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors'
import {
    selectIsTaskDetailOpen,
    selectSelectedTaskDetail,
    selectSelectedTaskId,
} from '../store/selectors/taskDetailSelectors'

import { TaskActivityTimeline } from './TaskActivityTimeline'
import { TaskCommentsSection } from './TaskCommentsSection'
import { TaskLabelChips } from './TaskLabelChips'
import { TaskResourceItem } from './TaskResourceItem'
import { TaskResourceSection } from './TaskResourceSection'

import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { TaskComputedStatus } from '../types/taskTypes'

//#region constants
const statusLabels: Record<TaskComputedStatus, string> = {
    todo: 'To do',
    in_progress: 'In progress',
    review: 'Review',
    done: 'Done',
    unfinished: 'Unfinished',
}

const statusStyles: Record<TaskComputedStatus, string> = {
    todo: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    in_progress:
        'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
    review:
        'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
    done: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
    unfinished:
        'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}

const priorityLabels = {
    low: 'Low priority',
    medium: 'Medium priority',
    high: 'High priority',
} as const

const priorityStyles = {
    low: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    medium:
        'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    high: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
} as const
//#endregion constants

//#region helpers
const formatDateTime = (value?: string) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const formatLinkMetadata = (link: ILink) => {
    let hostname = ''

    try {
        hostname = new URL(link.url).hostname.replace(/^www\./, '')
    } catch {
        hostname = link.url
    }

    return link.category !== 'other' ? `${link.category} • ${hostname}` : hostname
}

const formatNoteMetadata = (note: INote) =>
    note.category !== 'other' ? note.category : undefined
//#endregion helpers

//#region component
export function TaskDetailPanel() {
    //#region hooks
    const dispatch = useAppDispatch()
    const { t } = useI18n()

    const isOpen = useAppSelector(selectIsTaskDetailOpen)
    const selectedTaskId = useAppSelector(selectSelectedTaskId)
    const selectedTask = useAppSelector(selectSelectedTaskDetail)

    const attachedNotes = useAppSelector((state) =>
        selectedTaskId ? selectAttachedNotesByTaskId(state, selectedTaskId) : [],
    )
    const attachedLinks = useAppSelector((state) =>
        selectedTaskId ? selectAttachedLinksByTaskId(state, selectedTaskId) : [],
    )
    const suggestedNotes = useAppSelector((state) =>
        selectedTaskId ? selectSuggestedNotesByTaskId(state, selectedTaskId) : [],
    )
    const suggestedLinks = useAppSelector((state) =>
        selectedTaskId ? selectSuggestedLinksByTaskId(state, selectedTaskId) : [],
    )
    //#endregion hooks

    //#region local state
    const [draftTitle, setDraftTitle] = React.useState('')
    const [draftDescription, setDraftDescription] = React.useState('')
    const [previewNote, setPreviewNote] = React.useState<INote | null>(null)
    const titleInputRef = React.useRef<HTMLInputElement | null>(null)
    //#endregion local state

    //#region effects
    React.useEffect(() => {
        if (selectedTask) {
            setDraftTitle(selectedTask.title)
            setDraftDescription(selectedTask.description ?? '')
        } else if (!isOpen) {
            setDraftTitle('')
            setDraftDescription('')
        }
    }, [selectedTask, isOpen])

    React.useEffect(() => {
        if (isOpen && selectedTaskId && !selectedTask) {
            dispatch(closeTaskDetail())
        }
    }, [dispatch, isOpen, selectedTaskId, selectedTask])

    React.useEffect(() => {
        if (!isOpen) return

        const timer = window.setTimeout(() => {
            titleInputRef.current?.focus()
            titleInputRef.current?.select()
        }, 50)

        return () => window.clearTimeout(timer)
    }, [isOpen, selectedTaskId])

    React.useEffect(() => {
        setPreviewNote(null)
    }, [selectedTaskId])
    //#endregion effects

    //#region derived values
    const effectiveStatus = selectedTask ? getTaskEffectiveStatus(selectedTask) : null

    const isDirty =
        selectedTask != null &&
        (draftTitle !== selectedTask.title ||
            draftDescription !== (selectedTask.description ?? ''))
    //#endregion derived values

    //#region handlers
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            dispatch(closeTaskDetail())
        }
    }

    const handleSave = () => {
        if (!selectedTask) return

        const nextTitle = draftTitle.trim()
        const nextDescription = draftDescription.trim()
        const hasTitleChanged = nextTitle !== selectedTask.title

        if (!nextTitle) return

        dispatch(
            updateTask({
                id: selectedTask.id,
                changes: {
                    title: nextTitle,
                    description: nextDescription || undefined,
                },
            }),
        )

        if (hasTitleChanged) {
            dispatch(
                addTaskActivity({
                    id: crypto.randomUUID(),
                    taskId: selectedTask.id,
                    type: 'updated',
                    createdAt: new Date().toISOString(),
                }),
            )
        }

        setDraftTitle(nextTitle)
        setDraftDescription(nextDescription)
    }

    const handleReset = () => {
        if (!selectedTask) return

        setDraftTitle(selectedTask.title)
        setDraftDescription(selectedTask.description ?? '')
    }

    const handleAttachNote = (noteId: string) => {
        if (!selectedTaskId) return

        const createdAt = new Date().toISOString()

        dispatch(
            attachNoteToTask({
                taskId: selectedTaskId,
                noteId,
                createdAt,
            }),
        )

        dispatch(
            addTaskActivity({
                id: crypto.randomUUID(),
                taskId: selectedTaskId,
                type: 'updated',
                createdAt,
            }),
        )
    }

    const handleAttachLink = (linkId: string) => {
        if (!selectedTaskId) return

        const createdAt = new Date().toISOString()

        dispatch(
            attachLinkToTask({
                taskId: selectedTaskId,
                linkId,
                createdAt,
            }),
        )

        dispatch(
            addTaskActivity({
                id: crypto.randomUUID(),
                taskId: selectedTaskId,
                type: 'updated',
                createdAt,
            }),
        )
    }

    const handleDismissSuggestion = (
        entityType: 'note' | 'link',
        entityId: string,
    ) => {
        if (!selectedTaskId) return

        dispatch(
            dismissSuggestion({
                taskId: selectedTaskId,
                entityType,
                entityId,
                dismissedAt: new Date().toISOString(),
            }),
        )
    }

    const handleViewLink = (link: ILink) => {
        if (typeof window === 'undefined') {
            return
        }

        window.open(link.url, '_blank', 'noopener,noreferrer')
    }

    const handlePreviewNote = (note: INote) => {
        setPreviewNote(note)
    }
    //#endregion handlers

    //#region render
    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent
                side='right'
                className='w-full overflow-y-auto p-0 sm:right-3 sm:top-3 sm:bottom-3 sm:h-auto sm:max-w-xl sm:rounded-2xl sm:border'
            >
                {selectedTask ? (
                    <div className='flex h-full flex-col'>
                        <SheetHeader className='border-b border-slate-200 px-6 py-5 dark:border-slate-800'>
                            <SheetTitle className='text-left text-xl font-semibold text-slate-900 dark:text-slate-100'>
                                {t('Task details')}
                            </SheetTitle>
                            <SheetDescription>
                                {t('Review task context, notes, links, activity, and discussion')}
                            </SheetDescription>
                        </SheetHeader>

                        <div className='flex-1 space-y-6 px-6 py-6'>
                            <section className='space-y-4'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                                        {t('Title')}
                                    </label>
                                    <Input
                                        ref={titleInputRef}
                                        value={draftTitle}
                                        onChange={(event) => setDraftTitle(event.target.value)}
                                        placeholder={t('Enter task title')}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                                        {t('Description')}
                                    </label>
                                    <Textarea
                                        value={draftDescription}
                                        onChange={(event) => setDraftDescription(event.target.value)}
                                        placeholder={t('Write a short description')}
                                        className='min-h-32'
                                    />
                                </div>

                                <div className='flex flex-wrap items-center gap-2'>
                                    <Button
                                        type='button'
                                        onClick={handleSave}
                                        disabled={!isDirty || draftTitle.trim().length === 0}
                                    >
                                        <Check className='h-4 w-4' />
                                        {t('Save')}
                                    </Button>

                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handleReset}
                                        disabled={!isDirty}
                                    >
                                        <X className='h-4 w-4' />
                                        {t('Cancel changes')}
                                    </Button>
                                </div>
                            </section>

                            <section className='space-y-4'>
                                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                    {t('Metadata')}
                                </h3>

                                <div className='grid gap-3'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        {effectiveStatus ? (
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                                                    statusStyles[effectiveStatus],
                                                )}
                                            >
                                                {t(statusLabels[effectiveStatus])}
                                            </span>
                                        ) : null}

                                        <span
                                            className={cn(
                                                'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                                                priorityStyles[selectedTask.priority],
                                            )}
                                        >
                                            <Tag className='mr-1 h-3.5 w-3.5' />
                                            {t(priorityLabels[selectedTask.priority])}
                                        </span>
                                    </div>

                                    <TaskLabelChips labelIds={selectedTask.labelIds} />

                                    <div className='grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40'>
                                        <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                                            <CalendarDays className='mt-0.5 h-4 w-4 shrink-0' />
                                            <div>
                                                <p className='font-medium'>{t('Due date')}</p>
                                                <p className='text-slate-500 dark:text-slate-400'>
                                                    {selectedTask.dueDate
                                                        ? `${selectedTask.dueDate}${selectedTask.dueTime ? ` ${selectedTask.dueTime}` : ''}`
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                                            <Clock3 className='mt-0.5 h-4 w-4 shrink-0' />
                                            <div>
                                                <p className='font-medium'>{t('Created at')}</p>
                                                <p className='text-slate-500 dark:text-slate-400'>
                                                    {formatDateTime(selectedTask.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                                            <PencilLine className='mt-0.5 h-4 w-4 shrink-0' />
                                            <div>
                                                <p className='font-medium'>{t('Updated at')}</p>
                                                <p className='text-slate-500 dark:text-slate-400'>
                                                    {formatDateTime(selectedTask.updatedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                                            <FileText className='mt-0.5 h-4 w-4 shrink-0' />
                                            <div>
                                                <p className='font-medium'>{t('Task ID')}</p>
                                                <p className='break-all text-slate-500 dark:text-slate-400'>
                                                    {selectedTask.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className='space-y-4'>
                                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                    {t('Resources')}
                                </h3>

                                <div className='grid gap-4'>
                                    <TaskResourceSection
                                        title={t('Attached links')}
                                        itemCount={attachedLinks.length}
                                        emptyTitle={t('No attached links')}
                                        emptyDescription={t('')}
                                    >
                                        {attachedLinks.map((link) => (
                                            <TaskResourceItem
                                                key={link.id}
                                                title={link.title}
                                                entityType='link'
                                                metadata={formatLinkMetadata(link)}
                                                variant='attached'
                                                onView={() => handleViewLink(link)}
                                            />
                                        ))}
                                    </TaskResourceSection>

                                    <TaskResourceSection
                                        title={t('Suggested links')}
                                        itemCount={suggestedLinks.length}
                                        emptyTitle={t('No suggested links')}
                                        emptyDescription={t('')}
                                    >
                                        {suggestedLinks.map((suggestion) => (
                                            <TaskResourceItem
                                                key={suggestion.entity.id}
                                                title={suggestion.entity.title}
                                                entityType='link'
                                                metadata={formatLinkMetadata(suggestion.entity)}
                                                variant='suggested'
                                                score={suggestion.score}
                                                reasons={suggestion.reasons}
                                                onAttach={() => handleAttachLink(suggestion.entity.id)}
                                                onView={() => handleViewLink(suggestion.entity)}
                                                onDismiss={() =>
                                                    handleDismissSuggestion('link', suggestion.entity.id)
                                                }
                                            />
                                        ))}
                                    </TaskResourceSection>

                                    <TaskResourceSection
                                        title={t('Attached notes')}
                                        itemCount={attachedNotes.length}
                                        emptyTitle={t('No attached notes')}
                                        emptyDescription={t('')}
                                    >
                                        {attachedNotes.map((note) => (
                                            <TaskResourceItem
                                                key={note.id}
                                                title={note.title}
                                                entityType='note'
                                                metadata={formatNoteMetadata(note)}
                                                variant='attached'
                                                onView={() => handlePreviewNote(note)}
                                            />
                                        ))}
                                    </TaskResourceSection>

                                    <TaskResourceSection
                                        title={t('Suggested notes')}
                                        itemCount={suggestedNotes.length}
                                        emptyTitle={t('No suggested notes')}
                                        emptyDescription={t('')}
                                    >
                                        {suggestedNotes.map((suggestion) => (
                                            <TaskResourceItem
                                                key={suggestion.entity.id}
                                                title={suggestion.entity.title}
                                                entityType='note'
                                                metadata={formatNoteMetadata(suggestion.entity)}
                                                variant='suggested'
                                                score={suggestion.score}
                                                reasons={suggestion.reasons}
                                                onAttach={() => handleAttachNote(suggestion.entity.id)}
                                                onView={() => handlePreviewNote(suggestion.entity)}
                                                onDismiss={() =>
                                                    handleDismissSuggestion('note', suggestion.entity.id)
                                                }
                                            />
                                        ))}
                                    </TaskResourceSection>

                                    {previewNote ? (
                                        <section className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40'>
                                            <div className='flex items-start justify-between gap-3'>
                                                <div className='space-y-1'>
                                                    <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                                        {previewNote.title}
                                                    </h4>

                                                    {formatNoteMetadata(previewNote) ? (
                                                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                                                            {formatNoteMetadata(previewNote)}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => setPreviewNote(null)}
                                                >
                                                    <X className='h-4 w-4' />
                                                    Close preview
                                                </Button>
                                            </div>

                                            <div className='mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200'>
                                                {previewNote.content ? (
                                                    <p className='whitespace-pre-wrap break-words'>
                                                        {previewNote.content}
                                                    </p>
                                                ) : (
                                                    <p className='text-slate-500 dark:text-slate-400'>
                                                        {t('No note content available')}
                                                    </p>
                                                )}
                                            </div>
                                        </section>
                                    ) : null}
                                </div>
                            </section>

                            <TaskActivityTimeline taskId={selectedTask.id} />

                            <TaskCommentsSection taskId={selectedTask.id} />
                        </div>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    )
    //#endregion render
}
//#endregion component
