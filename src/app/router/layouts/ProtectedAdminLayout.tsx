import { Navigate, useLocation } from "react-router";

import { useAuth } from "@/contexts/AuthContext";

import { AdminLayout } from "./AdminLayout";

//#region loading ui
function AuthCheckingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center space-y-3">
        <div className="mx-auto h-9 w-9 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
        <h1 className="text-base font-semibold text-slate-900">
          Validating session
        </h1>
        <p className="text-sm text-slate-500">Checking your account access.</p>
      </div>
    </div>
  );
}
//#endregion loading ui

//#region component
export function ProtectedAdminLayout() {
  //#region hooks
  const { status, user } = useAuth();
  const location = useLocation();
  //#endregion hooks

  //#region dev bypass
  const DEV_BYPASS_PATHS = ["/tasks", "/notes"];
  
  const isDevFeatureBypass =
    import.meta.env.DEV &&
    DEV_BYPASS_PATHS.some((path) => location.pathname.startsWith(path));

  if (isDevFeatureBypass) {
    return <AdminLayout />;
  }
  //#endregion dev bypass

  //#region auth guards
  if (status === "loading") {
    return <AuthCheckingScreen />;
  }

  if (status === "unauthenticated") {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }
  //#endregion auth guards

  //region role guards
  const userRecord = (user ?? {}) as Record<string, unknown>;
  const roleRecord =
    userRecord.role && typeof userRecord.role === "object"
      ? (userRecord.role as Record<string, unknown>)
      : undefined;

  const roleId = Number(
    roleRecord?.id ??
      userRecord.roleId ??
      userRecord.role_id ??
      userRecord.role,
  );

  const roleNameCandidates = [
    roleRecord?.name,
    userRecord.roleName,
    userRecord.role_name,
    typeof userRecord.role === "string" ? userRecord.role : undefined,
  ];

  const normalizedRoleNames = roleNameCandidates
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase().replace(/[\s-]+/g, "_"))
    .filter(Boolean);

  const isAdminByName = normalizedRoleNames.some((name) =>
    ["admin", "administrator", "super_admin", "superadmin"].includes(name),
  );

  const isAdmin = roleId === 1 || isAdminByName;

  if (!isAdmin) {
    return <Navigate to="/auth/session-required?reason=forbidden" replace />;
  }
  //#endregion role guards

  //#region render
  return <AdminLayout />;
  //#endregion render
}
//#endregion component
