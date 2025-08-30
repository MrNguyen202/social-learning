import { useContext } from "react";
import { AuthContext } from "@/components/contexts/AuthProvider";

interface AuthState<T> {
  user: T | null;
  setUser: (user: T | null) => void;
  loading: boolean;
}

export default function useAuth<T = any>(): AuthState<T> {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context as AuthState<T>;
}