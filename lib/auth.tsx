"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

export type AuthUser = {
  id: number;
  code?: string | null;
  name: string;
  lastName?: string | null;
  email?: string | null;
  username?: string | null;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loginAt: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  bootstrap: (
    name: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const LOGIN_AT_KEY = "auth_login_at";

function readToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;
}

function readLoginAt() {
  return typeof window !== "undefined"
    ? localStorage.getItem(LOGIN_AT_KEY)
    : null;
}

function readUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistAuth(token: string, user: AuthUser) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function persistLoginAt(value: string) {
  localStorage.setItem(LOGIN_AT_KEY, value);
}

function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem(LOGIN_AT_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [loginAt, setLoginAt] = useState<string | null>(() => readLoginAt());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.auth
      .me()
      .then((me) => {
        setUser(me as AuthUser);
        localStorage.setItem("auth_user", JSON.stringify(me));
      })
      .catch(() => {
        clearAuth();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loginAt,
      loading,
      async login(username, password) {
        setLoading(true);
        try {
          const res = await api.auth.login({ username, password });
          persistAuth(res.token, res.user as AuthUser);
          const now = new Date().toISOString();
          persistLoginAt(now);
          setToken(res.token);
          setUser(res.user as AuthUser);
          setLoginAt(now);
        } finally {
          setLoading(false);
        }
      },
      async bootstrap(name, lastName, username, email, password) {
        setLoading(true);
        try {
          const res = await api.auth.bootstrap({
            name,
            lastName,
            username,
            email,
            password,
          });
          persistAuth(res.token, res.user as AuthUser);
          const now = new Date().toISOString();
          persistLoginAt(now);
          setToken(res.token);
          setUser(res.user as AuthUser);
          setLoginAt(now);
        } finally {
          setLoading(false);
        }
      },
      logout() {
        clearAuth();
        setToken(null);
        setUser(null);
        setLoginAt(null);
      },
    }),
    [loading, token, user, loginAt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
