'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({
  allowRoles,
  children
}: {
  allowRoles?: string[];
  children: React.ReactNode;
}) {
  const { token, loading, user } = useAuth();
  const router = useRouter();
  const unauthorized = Boolean(allowRoles && user?.role && !allowRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
    } else if (allowRoles && (!user?.role || !allowRoles.includes(user.role))) {
      router.replace("/app/dashboard");
    }
  }, [token, loading, user, allowRoles, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  if (unauthorized) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Access restricted</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your account does not have permission to open this area. If you think this is a mistake, ask an administrator to update your role.
          </p>
        </div>
      </div>
    );
  }

  if (allowRoles && (!user?.role || !allowRoles.includes(user.role))) return null;

  return <>{children}</>;
}
