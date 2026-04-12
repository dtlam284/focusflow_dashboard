import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import appReducer from '@/app/store/slices/appSlice'
import authReducer from '@/features/auth/store/slices/authSlice'
import tasksReducer from '@/features/tasks/store/slices/taskSlice'
import notesReducer from '@/features/notes/store/slices/noteSlice'
import linksReducer from '@/features/links/store/slices/linkSlice'

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

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch