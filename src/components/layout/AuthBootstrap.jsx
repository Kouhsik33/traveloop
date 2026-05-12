import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getMe } from "@/api/auth.api";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

/** Hydrates session from the backend HttpOnly auth cookie on app mount */
export function AuthBootstrap({ children }) {
  const setUser    = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const location = useLocation();

  useEffect(() => {
    const publicPaths = new Set([
      ROUTES.landing,
      ROUTES.login,
      ROUTES.signup,
      ROUTES.forgotPassword,
    ]);
    const isPublicPath = publicPaths.has(location.pathname) || location.pathname.startsWith("/public/");

    if (isPublicPath) {
      setHydrated(true);
      return;
    }

    let active = true;
    setHydrated(false);
    void getMe()
      .then((user) => {
        if (active) setUser(user);
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, [location.pathname, setUser, setHydrated, logout]);

  return children;
}
