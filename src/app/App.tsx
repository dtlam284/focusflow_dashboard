import React from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { PersistGate } from "redux-persist/integration/react"

import { queryClient } from "../services/core"
import { ThemeProvider } from "../hooks/useTheme"
import { Toaster } from "../components/ui/sonner"
import { AuthProvider } from "../contexts/AuthContext"
import { I18nProvider } from "../contexts/I18nContext"

import { persistor, store } from "../app/store/store"
import { router } from "../app/router/AppRouter"

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nProvider>
          <ThemeProvider defaultTheme="light" storageKey="app-theme">
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RouterProvider router={router} />
                <Toaster position="top-right" richColors closeButton />
              </AuthProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </I18nProvider>
      </PersistGate>
    </Provider>
  )
}
