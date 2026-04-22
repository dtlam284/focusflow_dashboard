import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ITask, ITaskCommentsState } from '@/features/tasks/types/taskTypes'

const STORAGE_KEY = 'cms-feature-state'

//#region types
export interface IPersistedFeatureState {
  tasks?: {
    items: ITask[]
  }
  taskComments?: ITaskCommentsState
  notes?: {
    items: INote[]
  }
  links?: {
    items: ILink[]
  }
}
//#endregion types

//#region load state
export const loadState = (): IPersistedFeatureState | undefined => {
  try {
    const serializedState = window.localStorage.getItem(STORAGE_KEY)

    if (!serializedState) {
      return undefined
    }

    return JSON.parse(serializedState) as IPersistedFeatureState
  } catch {
    return undefined
  }
}
//#endregion load state

//#region save state
export const saveState = (state: IPersistedFeatureState) => {
  try {
    const serializedState = JSON.stringify(state)
    window.localStorage.setItem(STORAGE_KEY, serializedState)
  } catch {
    // ignore write errors
  }
}
//#endregion save state
