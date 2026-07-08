import { useState } from "react";

import { db } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { UpgradeAccountDialog } from "#/components/upgrade-account-dialog";
import { usePostHog } from "@posthog/react";

function AccountButton() {
  const [open, setOpen] = useState(false);
  const user = db.useUser();
  const posthog = usePostHog();

  function handleLinkAccount() {
    posthog.capture("account_link_started");
    setOpen(true);
  }

  function handleSignOut() {
    posthog.capture("user_signed_out");
    posthog.reset();
    db.auth.signOut();
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{user.isGuest ? "Guest" : user.email}</span>
      {user.isGuest ? (
        <>
          <Button variant="outline" size="sm" onClick={handleLinkAccount}>
            Link account
          </Button>
          <UpgradeAccountDialog open={open} onOpenChange={setOpen} />
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      )}
    </div>
  );
}

export { AccountButton };
