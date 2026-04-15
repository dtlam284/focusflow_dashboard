import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import appReducer from '@/app/store/slices/appSlice'
import authReducer from '@/features/auth/store/slices/authSlice'
import tasksReducer, { hydrateTasks } from '@/features/tasks/store/slices/taskSlice'
import notesReducer, { hydrateNotes } from '@/features/notes/store/slices/noteSlice'
import linksReducer, { hydrateLinks } from '@/features/links/store/slices/linkSlice'

import { loadState, saveState } from '@/utils/storage'

const persistConfig = {
  key: 'cms',
  storage,
  whitelist: ['auth', 'app'],
}

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  tasks: tasksReducer,
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

const persistedFeatureState = loadState()

if (persistedFeatureState?.tasks?.items) {
  store.dispatch(hydrateTasks(persistedFeatureState.tasks.items))
}

if (persistedFeatureState?.notes?.items) {
  store.dispatch(hydrateNotes(persistedFeatureState.notes.items))
}

if (persistedFeatureState?.links?.items) {
  store.dispatch(hydrateLinks(persistedFeatureState.links.items))
}

store.subscribe(() => {
  const state = store.getState()

  saveState({
    tasks: {
      items: state.tasks.items,
    },
    notes: {
      items: state.notes.items,
    },
    links: {
      items: state.links.items,
    },
  })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch