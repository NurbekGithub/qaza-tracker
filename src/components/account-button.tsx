import { useState } from "react";

import { db } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { UpgradeAccountDialog } from "#/components/upgrade-account-dialog";

function AccountButton() {
  const [open, setOpen] = useState(false);
  const user = db.useUser();

  if (user.isGuest) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Save data
        </Button>
        <UpgradeAccountDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => db.auth.signOut()}>
      Sign out
    </Button>
  );
}

export { AccountButton };
