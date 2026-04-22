"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#111113] shadow-2xl shadow-black/40 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between border-r border-white/10 bg-[#0d0d10] p-10 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/50">ERP Platform</p>
                <h1 className="text-lg font-semibold tracking-tight">ERP Next</h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-4xl font-semibold leading-tight tracking-tight text-white">
                Minimal control for your business operations.
              </p>
              <p className="max-w-md text-sm leading-6 text-white/55">
                Clean access, focused workflow, and a calmer admin experience for your team.
              </p>
            </div>

            <div className="text-xs uppercase tracking-[0.24em] text-white/30">
              Secure access • Inventory • Orders • Reports
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                    <Box className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">ERP Platform</p>
                    <h1 className="text-lg font-semibold tracking-tight">ERP Next</h1>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {mode === "login" ? "Welcome back" : "Create admin account"}
                  </h2>
                  <p className="text-sm text-white/45">
                    {mode === "login"
                      ? "Sign in to continue to your dashboard."
                      : "Set up the first administrator for this workspace."}
                  </p>
                </div>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
                          className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Last name</label>
                        <Input
                          placeholder="Raoufi"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
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
                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Username</label>
                  <Input
                    placeholder="your_username"
                    value={mode === "login" ? loginUsername : username}
                    onChange={(e) =>
                      mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)
                    }
                    required
                    autoComplete="username"
                    className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="h-12 border-white/10 bg-white/5 pr-11 text-white placeholder:text-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/65"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-white text-black hover:bg-white/90"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <p className="text-center text-sm text-white/40">
                {mode === "login" ? (
                  <>
                    First time?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("bootstrap");
                        setError(null);
                      }}
                      className="font-medium text-white transition hover:text-white/70"
                    >
                      Set up admin account
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
                      className="font-medium text-white transition hover:text-white/70"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
