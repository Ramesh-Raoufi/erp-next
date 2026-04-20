"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── LEFT: visual panel ── */}
      <div className="relative hidden lg:block bg-zinc-950">
        {/* Big number watermark */}
        <span className="absolute bottom-10 left-10 text-[200px] font-black text-white/5 leading-none select-none">
          ERP
        </span>
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                <span className="text-zinc-950 font-black text-sm">E</span>
              </div>
              <span className="text-white font-semibold text-lg">ERP System</span>
            </div>
          </div>

          {/* Quote */}
          <div className="max-w-sm">
            <p className="text-3xl font-semibold text-white leading-snug">
              "The system that keeps your business moving — every single day."
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">A</div>
              <div>
                <p className="text-white text-sm font-medium">Ahmad Raoufi</p>
                <p className="text-white/50 text-xs">Logistics Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div className="flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">E</span>
            </div>
            <span className="font-semibold text-zinc-900">ERP System</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Set up your administrator account"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="mb-5 text-sm text-red-500 flex items-center gap-1.5">
              <span>⚠</span> {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "bootstrap" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">First name</label>
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      placeholder="Ahmad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">Last name</label>
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      placeholder="Raoufi"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Username</label>
              <input
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="your_username"
                value={mode === "login" ? loginUsername : username}
                onChange={(e) => mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Divider + toggle */}
          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            {mode === "login" ? (
              <p className="text-sm text-zinc-400">
                First time?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("bootstrap"); setError(null); }}
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Setup admin account
                </button>
              </p>
            ) : (
              <p className="text-sm text-zinc-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
