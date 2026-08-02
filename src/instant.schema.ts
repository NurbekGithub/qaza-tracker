// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    prayerEvents: i.entity({
      prayer: i.string().indexed(),
      type: i.string().indexed(),
      delta: i.number().optional(),
      value: i.number().optional(),
      at: i.number().indexed(),
      ownerId: i.string().indexed(),
    }),
    userPrefs: i.entity({
      ownerId: i.string().indexed().unique(),
      locale: i.string().optional(),
      updatedAt: i.number(),
    }),
    qazaProfiles: i.entity({
      ownerId: i.string().indexed(),
      birthDate: i.string(),
      gender: i.string().optional(),
      pubertyDate: i.string(),
      pubertyAuto: i.boolean().optional(),
      prayerStartDate: i.string().optional(),
      menstruationDays: i.number().optional(),
      safarDays: i.number().optional(),
      fastingStartDate: i.string().optional(),
      updatedAt: i.number(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
