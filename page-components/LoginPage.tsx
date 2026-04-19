"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { AppFooter } from "@/components/AppFooter";

export function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, bootstrap, loading, token } = useAuth();
  const [loginUsername, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace("/app/dashboard");
    }
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
      setError(err instanceof Error ? err.message : t("login.authFailed"));
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 grid place-items-center px-4 py-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-sm"
        >
        <div>
          <h1 className="text-xl font-semibold">
            {mode === "login"
              ? t("login.signInTitle")
              : t("login.createAdminTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? t("login.signInDesc")
              : t("login.createAdminDesc")}
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {mode === "bootstrap" ? (
          <div className="space-y-3">
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("login.name")}
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("login.lastName")}
              </div>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("login.username")}
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>
        ) : null}

        {mode === "login" ? (
          <label className="block space-y-1">
            <div className="text-xs text-muted-foreground">
              {t("login.username")}
            </div>
            <Input
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </label>
        ) : (
          <label className="block space-y-1">
            <div className="text-xs text-muted-foreground">
              {t("login.email")}
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        )}

        <label className="block space-y-1">
          <div className="text-xs text-muted-foreground">
            {t("login.password")}
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? t("login.pleaseWait")
            : mode === "login"
              ? t("login.signIn")
              : t("login.createAdmin")}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <button
              type="button"
              className="underline"
              onClick={() => setMode("bootstrap")}
            >
              {t("login.createFirstAdmin")}
            </button>
          ) : (
            <button
              type="button"
              className="underline"
              onClick={() => setMode("login")}
            >
              {t("login.backToSignIn")}
            </button>
          )}
        </div>
        </form>
      </div>
      <AppFooter />
    </div>
  );
}
