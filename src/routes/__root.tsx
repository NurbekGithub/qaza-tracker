import { useEffect } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { PostHogProvider } from "@posthog/react";

import { db } from "#/lib/db";
import { m } from "#/paraglide/messages";
import "../styles.css";

export const Route = createRootRoute({
  component: () => (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!}
      options={{
        api_host: "/ingest",
        ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
        defaults: "2026-01-30",
        capture_exceptions: true,
        debug: import.meta.env.DEV,
      }}
    >
      <RootComponent />
    </PostHogProvider>
  ),
});

function RootComponent() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">{m["state.loading"]()}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center p-4">
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
    <div className="flex min-h-full items-center justify-center">
      <div className="text-sm text-muted-foreground">{m["state.starting"]()}</div>
    </div>
  );
}
