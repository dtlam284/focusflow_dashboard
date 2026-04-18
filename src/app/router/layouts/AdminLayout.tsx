import React from "react"

import { AnimatePresence, motion } from "motion/react"
import { NavLink, Outlet, useLocation } from "react-router"
import { LayoutDashboard, LogOut, Menu, Search, CheckSquare, StickyNote } from "lucide-react"

import { cn } from "@/utils"
import { useIsMobile } from "@/hooks/useMobile"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"

//#region constants
const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notes", href: "/notes", icon: StickyNote },
]
//#endregion constants

//#region component
export function AdminLayout() {
  //#region hooks
  const { user, logout } = useAuth()
  const isMobile = useIsMobile(1024)
    const location = useLocation()
  //#endregion hooks

  //#region state
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile)
  //#endregion state

  //#region effects
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile, location.pathname])
  //#endregion effects

  //#region render
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0, x: sidebarOpen ? 0 : -256 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 lg:static lg:block transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-base tracking-tight text-slate-900 dark:text-white">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <span className="text-sm font-black">C</span>
            </div>
            CMS
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {`${user?.firstName?.[0] || "A"}${user?.lastName?.[0] || "D"}`}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                {user ? `${user.firstName} ${user.lastName}` : "Admin"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.role?.name || user?.email || "Administrator"}
              </p>
            </div>
            <button
              onClick={() => {
                void logout()
              }}
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          {user?.email ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          ) : null}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 flex-col min-w-0">
        {/* Header */}
        <header className="h-14 shrink-0 flex items-center justify-between px-3 lg:px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search modules..."
              aria-label="Search modules"
              data-skip-auto-label="true"
              className="w-full h-8 pl-9 pr-4 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
            />
          </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="cms-scrollbar flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 p-3 lg:p-4 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
  //#endregion render
}
//#endregion component
