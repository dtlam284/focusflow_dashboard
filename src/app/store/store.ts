import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import appReducer from '@/app/store/slices/appSlice'
import authReducer from '@/features/auth/store/slices/authSlice'
import linksReducer, { hydrateLinks } from '@/features/links/store/slices/linkSlice'
import notesReducer, { hydrateNotes } from '@/features/notes/store/slices/noteSlice'
import taskActivityReducer, { hydrateTaskActivities,} from '@/features/tasks/store/slices/taskActivitySlice'
import taskCommentsReducer, {
  hydrateTaskComments,
} from '@/features/tasks/store/slices/taskCommentsSlice'
import taskDetailReducer from '@/features/tasks/store/slices/taskDetailSlice'
import tasksReducer, { hydrateTasks } from '@/features/tasks/store/slices/taskSlice'

import { loadState, saveState } from '@/utils/storage'

//#region config & root reducer
const persistConfig = {
  key: 'cms',
  storage,
  whitelist: ['auth', 'app', 'links'],
}

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  tasks: tasksReducer,
  taskDetail: taskDetailReducer,
  taskComments: taskCommentsReducer,
  taskActivity: taskActivityReducer,
  notes: notesReducer,
  links: linksReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    }),
  devTools: import.meta.env.DEV,
})
//#endregion config & root reducer

//#region loading ui
const persistedFeatureState = loadState()

if (persistedFeatureState?.tasks?.items) {
  store.dispatch(hydrateTasks(persistedFeatureState.tasks.items))
}

if (persistedFeatureState?.taskComments?.byTaskId) {
  store.dispatch(hydrateTaskComments(persistedFeatureState.taskComments.byTaskId))
}

if (persistedFeatureState?.taskActivity?.items) {
  store.dispatch(hydrateTaskActivities(persistedFeatureState.taskActivity.items))
}

if (persistedFeatureState?.notes?.items) {
  store.dispatch(hydrateNotes(persistedFeatureState.notes.items))
}

if (persistedFeatureState?.links?.items) {
  store.dispatch(hydrateLinks(persistedFeatureState.links.items))
}
//#endregion loading ui

//#region subscribe to store changes
store.subscribe(() => {
  const state = store.getState()

  saveState({
    tasks: {
      items: state.tasks.items,
    },
    taskComments: {
      byTaskId: state.taskComments.byTaskId,
    },
    taskActivity: {
      items: state.taskActivity.items,
    },
    notes: {
      items: state.notes.items,
    },
    links: {
      items: state.links.items,
    },
  })
})
//#endregion subscribe to store changes

//#region exports
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
//#endregion exports
