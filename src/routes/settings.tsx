import { createFileRoute } from "@tanstack/react-router";

import { Layout } from "#/components/layout";
import { AccountButton } from "#/components/account-button";
import { PrayerCountsForm } from "#/components/prayer-counts-form";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <Layout title="Settings" showBack backTo="/">
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Account
        </h2>
        <AccountButton />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Prayer counts
        </h2>
        <PrayerCountsForm />
      </section>
    </Layout>
  );
}
