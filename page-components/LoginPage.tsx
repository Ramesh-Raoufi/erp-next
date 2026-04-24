"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_30%,#f8fafc_65%,#ffffff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border-b border-slate-200 bg-white px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                ERP Next admin access
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">ERP NEXT</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  Run operations from one clean workspace.
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-slate-500">
                  Sign in to manage products, orders, customers, and finance with a practical ERP workflow built for daily use.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                {[
                  ["Products", "Catalog, pricing, and stock visibility"],
                  ["Orders", "Track customer orders and delivery flow"],
                  ["Finance", "Manage invoices, bills, and payments"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-50 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-md rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">ERP NEXT</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {mode === "login" ? "Welcome back" : "Create admin account"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {mode === "login"
                      ? "Sign in to continue to your ERP workspace."
                      : "Set up the first administrator for this workspace."}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                  <LockKeyhole className="h-5 w-5" />
                </div>
              </div>

              {error && (
                <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "bootstrap" && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">First name</label>
                        <Input
                          placeholder="Ahmad"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Last name</label>
                        <Input
                          placeholder="Raoufi"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <Input
                    placeholder="Enter your username"
                    value={mode === "login" ? loginUsername : username}
                    onChange={(e) =>
                      mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)
                    }
                    required
                    autoComplete="username"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-11 text-slate-950 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create admin account"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>
                    First time here?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("bootstrap");
                        setError(null);
                      }}
                      className="font-medium text-slate-950 transition hover:text-slate-700"
                    >
                      Create admin account
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
                      className="font-medium text-slate-950 transition hover:text-slate-700"
                    >
                      Back to sign in
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
