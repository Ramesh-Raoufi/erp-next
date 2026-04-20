"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Package, TrendingUp, Truck, BarChart3, Shield, ArrowRight, ChevronLeft } from "lucide-react";
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

  // Auto-cycle features
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

  return (
    <div className="min-h-screen flex bg-white">

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ERP System</span>
          </div>

          {/* Main content */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-200 text-xs font-medium">All systems operational</span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Run your business<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  with confidence
                </span>
              </h1>
              <p className="mt-5 text-blue-200/80 text-lg leading-relaxed max-w-md">
                The complete ERP solution for logistics, finance, and inventory — all in one place.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                const isActive = i === activeFeature;
                return (
                  <button
                    key={feat.title}
                    type="button"
                    onClick={() => setActiveFeature(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left ${
                      isActive
                        ? "bg-white/10 border border-white/20 shadow-lg"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive ? "bg-blue-500 shadow-lg shadow-blue-500/40" : "bg-white/10"
                    }`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-300"}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isActive ? "text-white" : "text-blue-200"}`}>{feat.title}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? "text-blue-200" : "text-blue-400"}`}>{feat.desc}</p>
                    </div>
                    {isActive && <ArrowRight className="h-4 w-4 text-blue-300 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-blue-400/60 text-xs">© {new Date().getFullYear()} ERP System</p>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-400/60" />
              <span className="text-blue-400/60 text-xs">Secured & Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ERP System</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">

            {/* Header */}
            <div className="mb-8">
              {mode === "bootstrap" && (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to sign in
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Welcome back 👋" : "Setup your account"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "login"
                  ? "Enter your credentials to access the dashboard"
                  : "Create the first admin account for your ERP"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

              {mode === "bootstrap" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                        placeholder="Ahmad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                        placeholder="Raoufi"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                  placeholder="your_username"
                  value={mode === "login" ? loginUsername : username}
                  onChange={(e) => mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2"
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
                    {mode === "login" ? "Sign In" : "Create Admin Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {mode === "login" && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-2">First time here?</p>
                <button
                  type="button"
                  onClick={() => { setMode("bootstrap"); setError(null); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Setup Admin Account →
                </button>
              </div>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
