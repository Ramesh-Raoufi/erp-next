"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, BarChart3, CheckCircle2 } from "lucide-react";
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

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen flex">
      {/* Left side — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-blue-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">ERP System</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage your<br />business smarter
            </h1>
            <p className="mt-4 text-blue-200 text-lg">
              All your operations in one place. Fast, reliable, and easy to use.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { text: "Orders & Logistics", desc: "Track deliveries from origin to destination" },
              { text: "Finance & Accounting", desc: "Invoices, bills, and payment tracking" },
              { text: "Inventory Management", desc: "Real-time stock levels across locations" },
            ].map((feat) => (
              <div key={feat.text} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">{feat.text}</p>
                  <p className="text-blue-300 text-sm">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-sm">© {new Date().getFullYear()} ERP System. All rights reserved.</p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo on mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ERP System</span>
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "login" ? "Welcome back" : "Create Admin Account"}
            </h2>
            <p className="text-gray-500 mt-1">
              {mode === "login" ? "Sign in to your ERP dashboard" : "Set up your first admin user"}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "bootstrap" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input className={inputCls} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input className={inputCls} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" className={inputCls} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputCls + " pr-12"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Please wait…
                </>
              ) : mode === "login" ? "Sign In" : "Create Admin Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-4 text-center">
            {mode === "login" ? (
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                onClick={() => { setMode("bootstrap"); setError(null); }}
              >
                Setup Admin Account →
              </button>
            ) : (
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => { setMode("login"); setError(null); }}
              >
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
