import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InstallDialog } from "#/components/install-dialog";
import { isIos, isStandalone, useBeforeInstallPrompt } from "#/lib/pwa";
import { m } from "#/paraglide/messages";

export function InstallButton() {
  const deferredPrompt = useBeforeInstallPrompt();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isStandalone()) return null;

  const hasNativePrompt = !isIos() && deferredPrompt !== null;

  async function handleInstall() {
    if (hasNativePrompt && deferredPrompt) {
      await deferredPrompt.prompt();
    } else {
      setDialogOpen(true);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm">{m["install.settings_label"]()}</span>
        <span className="text-muted-foreground text-xs">{m["install.settings_hint"]()}</span>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" onClick={handleInstall}>
        {m["install.button"]()}
      </Button>
      <InstallDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
