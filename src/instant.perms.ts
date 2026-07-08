// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  prayers: {
    allow: {
      view: "isOwner",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: { isOwner: "auth.id != null && auth.id == data.ownerId" },
  },
  prayerEvents: {
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
