import { createFileRoute } from "@tanstack/react-router";

import { Layout } from "#/components/layout";
import { AccountButton } from "#/components/account-button";
import { PrayerCountsForm } from "#/components/prayer-counts-form";
import { InstallButton } from "#/components/install-button";
import { m } from "#/paraglide/messages";
import { isStandalone } from "#/lib/pwa";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <Layout title={m["nav.settings"]()} showBack showLanguage backTo="/">
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.account"]()}
        </h2>
        <AccountButton />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.prayer_counts"]()}
        </h2>
        <PrayerCountsForm />
      </section>

      {!isStandalone() && (
        <section>
          <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {m["install.settings_label"]()}
          </h2>
          <InstallButton />
        </section>
      )}
    </Layout>
  );
}
