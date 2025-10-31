import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "authUser";
const USERS_KEY = "users";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simple local credential check against stored users
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: Array<{ id: number; name: string; email: string; password?: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && (u as any).password === password);
    if (!found) throw new Error("Invalid credentials");
    const authUser: AuthUser = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: Array<{ id: number; name: string; email: string; password?: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = { id, name, email, password };
    const updated = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    const authUser: AuthUser = { id, name, email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, isAuthenticated: !!user }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

