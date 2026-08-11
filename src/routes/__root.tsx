import { Suspense, lazy, useEffect } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { db } from "#/lib/db";
import { ThemeProvider } from "#/components/theme-provider";
import "../styles.css";

const Toaster = lazy(() =>
  import("#/components/ui/sonner").then((mod) => ({ default: mod.Toaster })),
);

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <RootComponent />
    </ThemeProvider>
  ),
});

function RootComponent() {
  const { isLoading, user, error } = db.useAuth();

  useEffect(() => {
    if (isLoading || user || error) return;
    db.auth.signInAsGuest().catch((err) => {
      console.error("Failed to sign in as guest:", err);
    });
  }, [isLoading, user, error]);

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <Toaster position="top-center" />
      </Suspense>
    </>
  );
}
