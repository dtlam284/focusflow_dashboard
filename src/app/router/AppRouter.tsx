import React from "react"
import { createBrowserRouter } from "react-router"

import { LoginScreen } from "@/screens/Auth/LoginScreen"
import { NotFoundScreen } from "@/screens/NotFound/NotFoundScreen"
import { ErrorBoundaryScreen } from "@/screens/ErrorBoundaryScreen"
import { SessionRequiredScreen } from "@/screens/Auth/SessionRequiredScreen"

import { ProtectedAdminLayout } from "./layouts/ProtectedAdminLayout"

//#region lazy screens
const DashboardScreen = React.lazy(() =>
  import("@/screens/Dashboard/DashboardScreen").then((m) => ({ default: m.DashboardScreen })),
)

const TasksScreen = React.lazy(() =>
  import("@/screens/Tasks/TasksScreen").then((m) => ({ default: m.TasksScreen })),
)

const NotesScreen = React.lazy(() =>
  import("@/screens/Notes/NotesScreen").then((m) => ({ default: m.NotesScreen })),
);
//#endregion lazy screens

//#region helpers
function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      }
    >
      {children}
    </React.Suspense>
  )
}

function lazyRoute(LazyComponent: React.LazyExoticComponent<React.ComponentType>) {
  return function LazyRouteWrapper() {
    return (
      <SuspenseRoute>
        <LazyComponent />
      </SuspenseRoute>
    )
  }
}
//#endregion helpers

//#region routes
export const router = createBrowserRouter([
  {
    path: "/auth/login",
    Component: LoginScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/session-required",
    Component: SessionRequiredScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/",
    Component: ProtectedAdminLayout,
    ErrorBoundary: ErrorBoundaryScreen,
    children: [
      { index: true, Component: lazyRoute(DashboardScreen) },
      { path: "tasks", Component: lazyRoute(TasksScreen) },
      { path: "notes", Component: lazyRoute(NotesScreen) },
      { path: "*", Component: NotFoundScreen },
    ],
  },
])
//#endregion routes
