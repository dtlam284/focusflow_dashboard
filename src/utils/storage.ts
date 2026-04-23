import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { IBoardState } from '@/features/tasks/store/slices/boardSlice'
import type { ITask, ITaskCommentsState } from '@/features/tasks/types/taskTypes'
import type { ITaskRelationsState } from '@/features/tasks/types'

const STORAGE_KEY = 'cms-feature-state'

//#region props
export interface IPersistedFeatureState {
  tasks?: {
    items: ITask[]
  }
  taskComments?: ITaskCommentsState
  taskRelations?: ITaskRelationsState
  board?: IBoardState
  notes?: {
    items: INote[]
  }
  links?: {
    items: ILink[]
  }
}
//#endregion props

//#region load
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
//#endregion load

//#region save
export const saveState = (state: IPersistedFeatureState) => {
  try {
    const serializedState = JSON.stringify(state)
    window.localStorage.setItem(STORAGE_KEY, serializedState)
  } catch {
    // ignore write errors
  }
}
//#endregion save
