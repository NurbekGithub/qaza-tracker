// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  prayerEvents: {
    allow: {
      view: "isOwner",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: { isOwner: "auth.id != null && auth.id == data.ownerId" },
  },
  qazaProfiles: {
    allow: {
      view: "isOwner",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: { isOwner: "auth.id != null && auth.id == data.ownerId" },
  },
} satisfies InstantRules;

export default rules;
