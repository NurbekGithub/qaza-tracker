import { useEffect, useState } from "react";
import { DownloadIcon, XIcon } from "lucide-react";

import { Button } from "#/components/ui/button";
import { m } from "#/paraglide/messages";
import { isIos, isStandalone, promptInstall, useBeforeInstallPrompt } from "#/lib/pwa";

const DISMISS_KEY = "install-android-dismissed";

export function AndroidInstallBanner() {
  const deferredPrompt = useBeforeInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
  }, []);

  const shouldShow = !isIos() && !isStandalone() && deferredPrompt !== null && !dismissed;
  const [busy, setBusy] = useState(false);

  async function handleInstall() {
    if (busy) return;
    setBusy(true);
    await promptInstall();
    setBusy(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-safe-lg">
      <div className="bg-card text-card-foreground relative w-full max-w-sm rounded-2xl border p-4 shadow-lg">
        <button
          type="button"
          aria-label={m["install.android_dismiss"]()}
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground absolute right-2 top-2 cursor-pointer rounded-md p-1"
        >
          <XIcon className="size-4" />
        </button>

        <div className="pr-6 flex items-center gap-2">
          <DownloadIcon className="size-5 shrink-0" />
          <h2 className="text-base font-semibold">{m["install.android_title"]()}</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">{m["install.android_body"]()}</p>

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleInstall} disabled={busy}>
            {m["install.button"]()}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            {m["install.android_dismiss"]()}
          </Button>
        </div>
      </div>
    </div>
  );
}
