import { useEffect } from "react";
import { getMe } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { DEMO_USER } from "@/lib/constants";

/** Hydrates session from the backend HttpOnly auth cookie on app mount */
export function AuthBootstrap({ children }) {
  const setUser    = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    void getMe()
      .then((user) => setUser(user))
      .catch(() => setUser(DEMO_USER))
      .finally(() => setHydrated(true));
  }, [setUser, setHydrated]);

  return children;
}
