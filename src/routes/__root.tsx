import { Suspense, lazy, useEffect } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { db } from "#/lib/db";
import { ThemeProvider } from "#/components/theme-provider";
import { m } from "#/paraglide/messages";
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

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">{m["state.loading"]()}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!user) {
    return <GuestSignIn />;
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

function GuestSignIn() {
  useEffect(() => {
    db.auth.signInAsGuest().catch((err) => {
      console.error("Failed to sign in as guest:", err);
    });
  }, []);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-sm text-muted-foreground">{m["state.starting"]()}</p>
    </div>
  );
}
