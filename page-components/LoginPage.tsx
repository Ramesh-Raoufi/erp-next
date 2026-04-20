"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div style={{width: '440px', maxWidth: '100%'}} className="space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {mode === "login" ? "Sign in" : "Create admin"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login" ? "Enter your credentials below" : "Set up your admin account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠ {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "bootstrap" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">First name</label>
                    <Input placeholder="Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Last name</label>
                    <Input placeholder="Raoufi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input type="email" placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <Input
                placeholder="your_username"
                value={mode === "login" ? loginUsername : username}
                onChange={(e) => mode === "login" ? setLoginUsername(e.target.value) : setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-gray-500">
          {mode === "login" ? (
            <>First time?{" "}
              <button type="button" onClick={() => { setMode("bootstrap"); setError(null); }} className="font-medium text-gray-900 hover:underline">
                Setup admin account
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(null); }} className="font-medium text-gray-900 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
