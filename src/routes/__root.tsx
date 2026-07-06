import { useEffect } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { db } from "#/lib/db";
import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="text-sm text-red-600">{error.message}</div>
      </div>
    );
  }

  if (!user) {
    return <GuestSignIn />;
  }

  return (
    <>
      <Outlet />
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
      <div className="text-sm text-muted-foreground">Starting…</div>
    </div>
  );
}
