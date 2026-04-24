"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
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
    <div className="min-h-screen bg-white text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
        <section className="hidden bg-white lg:flex lg:items-center lg:justify-center">
          <div className="flex w-full max-w-xl items-center justify-center px-12">
            <div className="relative h-[360px] w-[360px]">
              <div className="absolute left-10 top-8 h-32 w-28 rounded-[28px] bg-slate-100" />
              <div className="absolute left-24 top-16 h-36 w-40 rounded-[32px] bg-blue-200 shadow-sm" />
              <div className="absolute left-16 top-28 h-3 w-12 rounded-full bg-blue-400" />
              <div className="absolute left-16 top-38 h-3 w-16 rounded-full bg-slate-300" />
              <div className="absolute left-28 top-32 h-20 w-28 rounded-2xl border border-white/70 bg-white/80" />
              <div className="absolute left-36 top-40 h-3 w-12 rounded-full bg-slate-200" />
              <div className="absolute left-36 top-48 h-3 w-16 rounded-full bg-slate-200" />
              <div className="absolute left-32 top-58 h-8 w-20 rounded-full bg-blue-600" />
              <div className="absolute bottom-20 left-8 h-20 w-24 rounded-[28px] bg-blue-50" />
              <div className="absolute bottom-12 left-24 h-8 w-28 rounded-full bg-blue-600" />
              <div className="absolute bottom-8 left-16 h-4 w-40 rounded-full bg-slate-900" />
              <div className="absolute bottom-20 right-12 h-24 w-24 rounded-[28px] bg-blue-50" />
              <div className="absolute bottom-26 right-16 h-3 w-12 rounded-full bg-blue-200" />
              <div className="absolute bottom-18 right-16 h-3 w-14 rounded-full bg-blue-200" />
              <div className="absolute bottom-10 right-14 h-20 w-12 rounded-[18px] bg-blue-100" />
              <div className="absolute right-10 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-[#0e73e8] px-6 py-10 sm:px-8">
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full border border-white/30" />
          <div className="pointer-events-none absolute -bottom-36 -right-24 h-[30rem] w-[30rem] rounded-full border border-white/20" />

          <div className="relative z-10 w-full max-w-[320px] rounded-[18px] bg-white px-7 py-8 shadow-[0_22px_70px_rgba(15,23,42,0.18)]">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {mode === "login" ? "Hello!" : "Create account"}
              </h1>
              <p className="mt-3 text-base text-slate-500">
                {mode === "login" ? "Sign Up to Get Started" : "Set up your admin workspace"}
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "bootstrap" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First name</label>
                    <Input
                      placeholder="Ahmad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-14 rounded-full border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last name</label>
                    <Input
                      placeholder="Raoufi"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-14 rounded-full border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="sr-only">{mode === "login" ? "Username" : "Email"}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    type={mode === "login" ? "text" : "email"}
                    placeholder={mode === "login" ? "Email Address" : "Email Address"}
                    value={mode === "login" ? loginUsername : email}
                    onChange={(e) =>
                      mode === "login" ? setLoginUsername(e.target.value) : setEmail(e.target.value)
                    }
                    required
                    autoComplete={mode === "login" ? "username" : "email"}
                    className="h-14 rounded-full border-slate-200 bg-white pl-12 pr-4 text-slate-950 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {mode === "bootstrap" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="h-14 rounded-full border-slate-200 bg-white px-5 text-slate-950 placeholder:text-slate-300"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="sr-only">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="h-14 rounded-full border-slate-200 bg-white pl-12 pr-12 text-slate-950 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-slate-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-full bg-[#0e73e8] text-sm font-medium text-white hover:bg-[#0b67d2]"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </span>
              </Button>
            </form>

            <div className="mt-5 text-sm text-slate-500">
              {mode === "login" ? (
                <div className="flex items-center justify-between gap-3">
                  <button type="button" className="text-slate-500 transition hover:text-slate-700">
                    Forgot Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("bootstrap");
                      setError(null);
                    }}
                    className="font-medium text-slate-950 transition hover:text-slate-700"
                  >
                    Create account
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-medium text-slate-950 transition hover:text-slate-700"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
