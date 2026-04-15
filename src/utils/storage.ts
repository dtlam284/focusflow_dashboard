import type { ITask } from '@/features/tasks/types/taskTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ILink } from '@/features/links/types/linkTypes'

const STORAGE_KEY = 'focusflow-persisted-state'

export interface IPersistedFeatureState {
  tasks: {
    items: ITask[]
  }
  notes: {
    items: INote[]
  }
  links: {
    items: ILink[]
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getItemsArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function loadState(): IPersistedFeatureState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return undefined

    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) return undefined

    const tasksRecord = isRecord(parsed.tasks) ? parsed.tasks : undefined
    const notesRecord = isRecord(parsed.notes) ? parsed.notes : undefined
    const linksRecord = isRecord(parsed.links) ? parsed.links : undefined

    return {
      tasks: {
        items: getItemsArray<ITask>(tasksRecord?.items),
      },
      notes: {
        items: getItemsArray<INote>(notesRecord?.items),
      },
      links: {
        items: getItemsArray<ILink>(linksRecord?.items),
      },
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
    return undefined
  }
}

export function saveState(state: IPersistedFeatureState): void {
  try {
    const serialized = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}