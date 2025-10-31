import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sqliteUsers } from "../sqlite/db";

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
    const e = email.trim();
    const p = password.trim();
    const found = await sqliteUsers.findForLogin(e, p);
    if (!found) throw new Error("Invalid credentials");
    const authUser: AuthUser = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const n = name.trim();
    const e = email.trim();
    const p = password.trim();
    const exists = await sqliteUsers.findByEmail(e);
    if (exists) throw new Error("Email already registered");
    const created = await sqliteUsers.create({ name: n, email: e, password: p });
    const authUser: AuthUser = { id: created.id, name: created.name, email: created.email };
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
