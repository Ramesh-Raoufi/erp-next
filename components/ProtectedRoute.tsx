'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (!token) return null;
  if (allowRoles && (!user?.role || !allowRoles.includes(user.role))) return null;

  return <>{children}</>;
}
