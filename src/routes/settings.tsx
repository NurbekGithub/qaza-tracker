import { createFileRoute } from "@tanstack/react-router";

import { Layout } from "#/components/layout";
import { AccountButton } from "#/components/account-button";
import { PrayerCountsForm } from "#/components/prayer-counts-form";
import { LanguageSwitcher } from "#/components/language-switcher";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <Layout title={m["nav.settings"]()} showBack backTo="/">
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.language"]()}
        </h2>
        <LanguageSwitcher />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.account"]()}
        </h2>
        <AccountButton />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.prayer_counts"]()}
        </h2>
        <PrayerCountsForm />
      </section>
    </Layout>
  );
}
