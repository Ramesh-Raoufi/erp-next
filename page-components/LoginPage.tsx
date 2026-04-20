"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LayoutDashboard, ShieldCheck, Package, TrendingUp, Truck } from "lucide-react";
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

  const inp = "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="flex w-full max-w-5xl gap-6 items-stretch">

        {/* ── LEFT: dark card ── */}
        <div className="hidden lg:flex w-72 shrink-0 flex-col justify-between rounded-2xl bg-gray-900 p-8 text-white">
          {/* Logo */}
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold leading-snug">ERP System</h2>
            <p className="text-sm text-gray-400 mt-1">Business Management Platform</p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {[
              { icon: Truck, label: "Orders & Logistics" },
              { icon: TrendingUp, label: "Finance & Accounting" },
              { icon: Package, label: "Inventory Management" },
              { icon: ShieldCheck, label: "Secure & Reliable" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} ERP System</p>
        </div>

        {/* ── RIGHT: content ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Sign in card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">ERP System</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-400 mt-1">Enter your credentials to access the dashboard</p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                <input
                  className={inp}
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inp + " pr-11"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          {/* ── BOTTOM RIGHT: Admin setup card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">First time setup?</h2>
                <p className="text-sm text-gray-400 mt-1">Create your administrator account to get started</p>
              </div>
              <button
                type="button"
                onClick={() => setMode(mode === "bootstrap" ? "login" : "bootstrap")}
                className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {mode === "bootstrap" ? "Back to Sign In" : "Setup Admin →"}
              </button>
            </div>

            {mode === "bootstrap" && (
              <form onSubmit={onSubmit} className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                    <input className={inp} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                    <input className={inp} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                  <input type="email" className={inp} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                  <input className={inp} placeholder="admin_username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                  <input type="password" className={inp} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Creating…" : "Create Admin Account"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
