import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { AndroidInstallBanner } from "#/components/android-install-banner";
import { IosInstallBanner } from "#/components/ios-install-banner";
import { ReloadPrompt } from "#/components/reload-prompt";
import { getLocale } from "#/paraglide/runtime";

document.documentElement.lang = getLocale();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;
rootElement.replaceChildren();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <>
    <RouterProvider router={router} />
    <ReloadPrompt />
    <IosInstallBanner />
    <AndroidInstallBanner />
  </>,
);

const bootAnalytics = () => void import("#/lib/analytics").then((m) => m.loadAnalytics());
if ("requestIdleCallback" in window) {
  requestIdleCallback(bootAnalytics, { timeout: 3000 });
} else {
  setTimeout(bootAnalytics, 0);
}
