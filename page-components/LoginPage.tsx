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

  const inp = "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition bg-white";

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f2f5" }}>

      {/* Left panel — dark */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col justify-between p-10" style={{ background: "#1a1d23" }}>
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">E</div>
            <span className="text-white font-semibold text-sm">ERP System</span>
          </div>
          <div className="space-y-6">
            {["Orders & Logistics", "Finance & Accounting", "Inventory", "Reports"].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: "#3b4554" }}>0{i + 1}</span>
                <span className="text-sm" style={{ color: "#8b9ab0" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: "#3b4554" }}>© {new Date().getFullYear()} ERP System</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-10 py-5">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">E</div>
            <span className="font-semibold text-sm text-gray-900">ERP System</span>
          </div>
          <div className="ml-auto">
            {mode === "login" ? (
              <button type="button" onClick={() => { setMode("bootstrap"); setError(null); }} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                Setup admin account →
              </button>
            ) : (
              <button type="button" onClick={() => { setMode("login"); setError(null); }} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[360px] bg-white rounded-2xl border border-gray-200 p-8" style={{boxShadow: '0 2px 12px rgba(0,0,0,0.07)'}}>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Sign in" : "Create admin"}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {mode === "login" ? "Access your ERP dashboard" : "Set up your admin account"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="mb-5 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                ⚠ {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "bootstrap" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">First name</label>
                      <input className={inp} placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
                      <input className={inp} placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input type="email" className={inp} placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <input className={inp} placeholder="your_username" value={mode === "login" ? loginUsername : username}
                  onChange={(e) => mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)} required autoComplete="username" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className={inp + " pr-10"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "login" ? "current-password" : "new-password"} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg> Please wait…</>
                ) : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
