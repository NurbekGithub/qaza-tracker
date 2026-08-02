import { useContext, createContext } from "react";
import type { PostHog } from "posthog-js";

export interface Analytics {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string) => void;
  reset: () => void;
  captureException: (error: unknown) => void;
}

let client: PostHog | null = null;
const pending: Array<(posthog: PostHog) => void> = [];

function whenReady(fn: (posthog: PostHog) => void) {
  if (client) return fn(client);
  pending.push(fn);
}

export async function loadAnalytics() {
  if (client) return;
  const { default: posthog } = await import("posthog-js");
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: "/ingest",
    ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: false,
  });
  client = posthog;
  pending.splice(0).forEach((fn) => fn(posthog));
}

export const analytics: Analytics = {
  capture: (event, properties) => whenReady((p) => p.capture(event, properties)),
  identify: (distinctId) => whenReady((p) => p.identify(distinctId)),
  reset: () => whenReady((p) => p.reset()),
  captureException: (error) => whenReady((p) => p.captureException(error)),
};

const AnalyticsContext = createContext<Analytics>(analytics);

export function usePostHog(): Analytics {
  return useContext(AnalyticsContext);
}
