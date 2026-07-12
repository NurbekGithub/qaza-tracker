import { useEffect, useState } from "react";
import { PlusIcon, ShareIcon, XIcon } from "lucide-react";

import { Button } from "#/components/ui/button";
import { m } from "#/paraglide/messages";
import { isIos, isStandalone } from "#/lib/pwa";

const DISMISS_KEY = "install-ios-dismissed";

export function IosInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIos() || isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-6">
      <div className="bg-card text-card-foreground relative w-full max-w-sm rounded-2xl border p-4 shadow-lg">
        <button
          type="button"
          aria-label={m["install.ios_dismiss"]()}
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground absolute right-2 top-2 cursor-pointer rounded-md p-1"
        >
          <XIcon className="size-4" />
        </button>

        <h2 className="pr-6 text-base font-semibold">{m["install.ios_title"]()}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{m["install.ios_body"]()}</p>

        <ol className="mt-3 space-y-2">
          <li className="flex items-center gap-3 text-sm">
            <ShareIcon className="size-4 shrink-0" />
            <span>{m["install.ios_step_share"]()}</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <PlusIcon className="size-4 shrink-0" />
            <span>{m["install.ios_step_add"]()}</span>
          </li>
        </ol>

        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={dismiss}>
          {m["install.ios_dismiss"]()}
        </Button>
      </div>
    </div>
  );
}
