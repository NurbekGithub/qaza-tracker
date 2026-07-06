import { useState } from "react";

import { db } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { UpgradeAccountDialog } from "#/components/upgrade-account-dialog";
import { usePostHog } from "@posthog/react";

function AccountButton() {
  const [open, setOpen] = useState(false);
  const user = db.useUser();
  const posthog = usePostHog();

  if (user.isGuest) {
    function handleSaveData() {
      posthog.capture("account_link_started");
      setOpen(true);
    }

    return (
      <>
        <Button variant="outline" size="sm" onClick={handleSaveData}>
          Save data
        </Button>
        <UpgradeAccountDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  function handleSignOut() {
    posthog.capture("user_signed_out");
    posthog.reset();
    db.auth.signOut();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}

export { AccountButton };
