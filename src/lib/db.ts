import { init } from "@instantdb/react";

import schema from "#/instant.schema";

const appId = import.meta.env.VITE_INSTANT_APP_ID;

if (!appId) {
  throw new Error("VITE_INSTANT_APP_ID is not set");
}

export const db = init({ appId, schema, devtool: false });

export function transact(...args: Parameters<typeof db.transact>) {
  db.transact(...args).catch((error) => {
    console.error("[db.transact] failed", error);
  });
}
