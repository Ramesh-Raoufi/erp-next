"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Box, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const router = useRouter();
  const { login, bootstrap, loading, token } = useAuth();
  const [loginUsername, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) router.replace("/app/dashboard");
  }, [router, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(loginUsername, password);
      } else {
        await bootstrap(name, lastName, username, email, password);
      }
      router.replace("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-7">
            <Box className="h-5 w-5 text-slate-900" />
            <span className="font-semibold text-slate-900 text-base">ERP System</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            {mode === "bootstrap" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-slate-900 mb-4"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            <h1 className="text-xl font-semibold text-slate-900">
              {mode === "login" ? "Sign in" : "Create Admin Account"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "login"
                ? "Enter your credentials to continue"
                : "Set up your first administrator account"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="mb-5 text-sm text-red-600">⚠ {error}</p>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "bootstrap" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">First Name</label>
                    <input className={inputCls} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">Last Name</label>
                    <input className={inputCls} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
                  <input type="email" className={inputCls} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Username</label>
              <input
                className={inputCls}
                placeholder="your_username"
                value={mode === "login" ? loginUsername : username}
                onChange={(e) => mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputCls + " pr-10"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Please wait…
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setMode("bootstrap"); setError(null); }}
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                First time? Setup admin →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
