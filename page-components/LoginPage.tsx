"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Package, TrendingUp, Truck, BarChart3, ArrowRight, ChevronLeft, Box } from "lucide-react";
import { useAuth } from "@/lib/auth";

const FEATURES = [
  { icon: Truck, title: "Orders & Logistics", desc: "Track every shipment from warehouse to delivery" },
  { icon: TrendingUp, title: "Finance & Accounting", desc: "Invoices, bills, double-entry bookkeeping" },
  { icon: Package, title: "Inventory Management", desc: "Real-time stock levels across all locations" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Insights to grow your business faster" },
];

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
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (token) router.replace("/app/dashboard");
  }, [router, token]);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature((i) => (i + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

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

  const inputCls = "w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-700 transition-all";

  return (
    <div className="min-h-screen flex bg-slate-900">

      {/* ── LEFT PANEL — matches dashboard sidebar ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 border-r border-slate-700">

        {/* Subtle blue glow */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #1d4ed8, transparent)" }} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Logo — same as sidebar */}
          <div className="flex items-center gap-2 border-b border-slate-700 pb-6">
            <Box className="h-6 w-6 text-blue-400" />
            <span className="text-white font-bold text-lg tracking-tight">ERP System</span>
          </div>

          {/* Hero */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 border border-slate-700 bg-slate-800">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-400 text-xs">All systems operational</span>
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
                Manage your<br />
                <span className="text-blue-400">business smarter</span>
              </h1>
              <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
                Complete ERP for logistics, finance, and inventory — all in one platform.
              </p>
            </div>

            {/* Feature list — same style as sidebar nav */}
            <div className="space-y-1">
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                const isActive = i === activeFeature;
                return (
                  <button
                    key={feat.title}
                    type="button"
                    onClick={() => setActiveFeature(i)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feat.title}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? "text-blue-200" : "text-slate-500"}`}>{feat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveFeature(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeFeature ? "24px" : "6px",
                    background: i === activeFeature ? "#2563eb" : "#334155"
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs border-t border-slate-700 pt-4">© {new Date().getFullYear()} ERP System · All rights reserved</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-900">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 border-b border-slate-700 pb-6">
            <Box className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white">ERP System</span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">

            {/* Header */}
            <div className="mb-7">
              {mode === "bootstrap" && (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <h2 className="text-xl font-bold text-white">
                {mode === "login" ? "Sign in to ERP" : "Create Admin Account"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {mode === "login"
                  ? "Enter your credentials to continue"
                  : "Set up your first administrator account"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "bootstrap" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
                      <input className={inputCls} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                      <input className={inputCls} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                    <input type="email" className={inputCls} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
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
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {mode === "login" && (
              <div className="mt-6 pt-5 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-500 mb-2">First time here?</p>
                <button
                  type="button"
                  onClick={() => { setMode("bootstrap"); setError(null); }}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Setup Admin Account →
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-600 mt-5">🔒 Secured with JWT authentication</p>
        </div>
      </div>
    </div>
  );
}
// slate-900 theme
