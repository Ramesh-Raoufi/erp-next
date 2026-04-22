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
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/10">
              <Box className="h-6 w-6" />
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">ERP Next</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {mode === "login" ? "Login" : "Create admin account"}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
              {mode === "login"
                ? "Access your dashboard and manage the business from one place."
                : "Create the first admin user to activate your ERP workspace."}
            </p>
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
                      className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Last name</label>
                    <Input
                      placeholder="Raoufi"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25"
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
                    className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25"
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
                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25"
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
                  className="h-12 rounded-xl border-white/10 bg-white/5 pr-11 text-white placeholder:text-white/25"
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
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create admin account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/45">
            {mode === "login" ? (
              <>
                Need to set up the system?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("bootstrap");
                    setError(null);
                  }}
                  className="font-medium text-white transition hover:text-white/75"
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
                  className="font-medium text-white transition hover:text-white/75"
                >
                  Back to login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
