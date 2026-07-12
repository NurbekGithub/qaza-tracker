import { useRegisterSW } from "virtual:pwa-register/react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="bg-card text-card-foreground flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border p-3 shadow-lg">
        <p className="text-sm">
          {offlineReady ? m["reload.offline_ready"]() : m["reload.new_content"]()}
        </p>
        <div className="flex shrink-0 gap-1">
          {needRefresh && (
            <Button size="sm" onClick={() => updateServiceWorker(true)}>
              {m["reload.reload"]()}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={close}>
            {m["reload.close"]()}
          </Button>
        </div>
      </div>
    </div>
  );
}
