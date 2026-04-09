import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/app/store/hooks";
import { loginAdmin } from "@/features/auth/store/slices/authSlice";
import { ShieldCheck } from "lucide-react";
import React from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status, refreshProfile } = useAuth();
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const redirect = searchParams.get("redirect") || "/";

  if (status === "authenticated") {
    return <Navigate to={redirect} replace />;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center space-y-3">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
          <h1 className="text-base font-semibold text-slate-900">
            Checking existing session
          </h1>
          <p className="text-sm text-slate-500">Please wait.</p>
        </div>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        loginAdmin({
          email: email.trim(),
          password,
        }),
      ).unwrap();

      const profile = await refreshProfile();
      if (!profile) {
        throw new Error("Unable to validate session");
      }

      navigate(redirect, { replace: true });
      toast.success("Signed in");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Use your admin credentials to access Base CMS.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="email"
              autoComplete="email"
              title="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              title="Password"
              placeholder="Enter your password"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
