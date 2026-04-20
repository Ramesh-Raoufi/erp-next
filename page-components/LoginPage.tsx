"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Package, TrendingUp, Truck, BarChart3, ArrowRight, ChevronLeft, Zap } from "lucide-react";
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

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white";

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ERP System</span>
          </div>

          {/* Hero text */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-purple-400/30" style={{ background: "rgba(168,85,247,0.15)" }}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-purple-200 text-xs font-medium">All systems operational</span>
              </div>
              <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                Business at<br />
                <span style={{ background: "linear-gradient(90deg, #a855f7, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  full speed
                </span>
              </h1>
              <p className="mt-5 text-purple-200/70 text-base leading-relaxed max-w-sm">
                The complete ERP for logistics, finance, and inventory — all in one powerful platform.
              </p>
            </div>

            {/* Animated features */}
            <div className="space-y-2">
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                const isActive = i === activeFeature;
                return (
                  <button
                    key={feat.title}
                    type="button"
                    onClick={() => setActiveFeature(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-500 ${
                      isActive ? "border border-purple-400/40" : "border border-transparent hover:border-white/10"
                    }`}
                    style={isActive ? { background: "rgba(168,85,247,0.2)" } : { background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all`}
                      style={isActive
                        ? { background: "linear-gradient(135deg, #a855f7, #6366f1)" }
                        : { background: "rgba(255,255,255,0.08)" }
                      }
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isActive ? "text-white" : "text-purple-200"}`}>{feat.title}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? "text-purple-200" : "text-purple-400"}`}>{feat.desc}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: "linear-gradient(180deg, #a855f7, #6366f1)" }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveFeature(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeFeature ? "24px" : "6px",
                    background: i === activeFeature ? "#a855f7" : "rgba(255,255,255,0.2)"
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-purple-400/50 text-xs">© {new Date().getFullYear()} ERP System · All rights reserved</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#f8f7ff" }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ERP System</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl" style={{ boxShadow: "0 25px 60px rgba(139, 92, 246, 0.12), 0 4px 20px rgba(0,0,0,0.06)" }}>

            {/* Header */}
            <div className="mb-8">
              {mode === "bootstrap" && (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #f3f0ff, #ede9fe)" }}>
                <span className="text-2xl">{mode === "login" ? "👋" : "🚀"}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Welcome back!" : "Get started"}
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                {mode === "login" ? "Sign in to your ERP dashboard" : "Create the first admin account"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48" }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "bootstrap" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">First Name</label>
                      <input className={inputCls} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Last Name</label>
                      <input className={inputCls} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                    <input type="email" className={inputCls} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Username</label>
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
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl text-white font-bold py-3.5 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 8px 24px rgba(139,92,246,0.4)" }}
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
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-2">First time setting up?</p>
                <button
                  type="button"
                  onClick={() => { setMode("bootstrap"); setError(null); }}
                  className="text-sm font-semibold transition-colors"
                  style={{ color: "#a855f7" }}
                >
                  Create Admin Account →
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">🔒 Secured with JWT authentication</p>
        </div>
      </div>
    </div>
  );
}
