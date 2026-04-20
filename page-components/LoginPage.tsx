"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Box, ArrowRight, ChevronLeft } from "lucide-react";
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

  const inputCls = "w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-3 text-base text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-600 transition-colors";

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left — branding column */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between bg-gray-50 border-r border-gray-100 p-12">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900 text-sm tracking-tight">ERP System</span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">What you get</p>
            <div className="space-y-6">
              {[
                { num: "01", title: "Orders & Logistics", desc: "End-to-end shipment tracking" },
                { num: "02", title: "Finance", desc: "Invoices, bills, accounting" },
                { num: "03", title: "Inventory", desc: "Stock levels & movements" },
                { num: "04", title: "Reports", desc: "Analytics and insights" },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4">
                  <span className="text-xs font-mono text-gray-300 mt-0.5 shrink-0">{item.num}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-300">© {new Date().getFullYear()} ERP System</p>
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 lg:border-0">
          <div className="flex items-center gap-2 lg:hidden">
            <Box className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm text-gray-900">ERP System</span>
          </div>
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => { setMode("bootstrap"); setError(null); }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              First time? Setup admin
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to sign in
            </button>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Title */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {mode === "login" ? "Sign in" : "Create account"}
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                {mode === "login"
                  ? "Welcome back. Enter your details below."
                  : "Set up your first admin account."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-center gap-2 text-sm text-red-500">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {mode === "bootstrap" && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">First Name</label>
                      <input className={inputCls} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Last Name</label>
                      <input className={inputCls} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                    <input type="email" className={inputCls} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Username</label>
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
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputCls + " pr-8"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-0 bottom-3 text-gray-300 hover:text-gray-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : null}
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
