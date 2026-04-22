"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.01))]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden space-y-8 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
              <Shield className="h-4 w-4 text-cyan-300" />
              Secure ERP access
            </div>

            <div className="space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/80">ERP NEXT</p>
              <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
                Clean, focused access to your entire business workspace.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/60">
                Manage inventory, orders, payments, and reports with a login experience that feels premium and simple.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4">
              {[
                ["01", "Inventory"],
                ["02", "Orders"],
                ["03", "Reports"],
              ].map(([index, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">{index}</p>
                  <p className="mt-3 text-lg font-medium text-white/85">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-lg">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/35">ERP NEXT</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    {mode === "login" ? "Welcome back" : "Create admin"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {mode === "login"
                      ? "Sign in to continue to your dashboard."
                      : "Set up the first account for this ERP workspace."}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <Shield className="h-6 w-6 text-cyan-300" />
                </div>
              </div>

              {error && (
                <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "bootstrap" && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">First name</label>
                        <Input
                          placeholder="Ahmad"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Last name</label>
                        <Input
                          placeholder="Raoufi"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Email</label>
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Username</label>
                  <Input
                    placeholder="Enter your username"
                    value={mode === "login" ? loginUsername : username}
                    onChange={(e) =>
                      mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)
                    }
                    required
                    autoComplete="username"
                    className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="h-12 rounded-2xl border-white/10 bg-black/20 pr-11 text-white placeholder:text-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-2xl bg-cyan-400 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? "Please wait..." : mode === "login" ? "Login to dashboard" : "Create admin account"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-white/45">
                {mode === "login" ? (
                  <>
                    Need to initialize the system?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("bootstrap");
                        setError(null);
                      }}
                      className="font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      Create admin
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                      className="font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      Back to login
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
