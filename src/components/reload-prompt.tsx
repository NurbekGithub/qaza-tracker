import { useRegisterSW } from "virtual:pwa-register/react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";

const updateCheckIntervalMs = 60 * 60 * 1000; // 1 hour

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) registration.update();
      }, updateCheckIntervalMs);
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => setNeedRefresh(false);

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-safe-md">
      <div className="bg-card text-card-foreground flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border p-3 shadow-lg">
        <p className="text-sm">{m["reload.new_content"]()}</p>
        <div className="flex shrink-0 gap-1">
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            {m["reload.reload"]()}
          </Button>
          <Button size="sm" variant="outline" onClick={close}>
            {m["reload.close"]()}
          </Button>
        </div>
      </div>
    </div>
  );
}
