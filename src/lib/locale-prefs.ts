import { lookup } from "@instantdb/react";

import { db, transact } from "#/lib/db";

export function saveLocalePref(ownerId: string, locale: string) {
  transact(
    db.tx.userPrefs[lookup("ownerId", ownerId)].update({
      ownerId,
      locale,
      updatedAt: Date.now(),
    }),
  );
}
