import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";
import { AccountButton } from "#/components/account-button";
import { PrayerCountsForm } from "#/components/prayer-counts-form";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <main className="mx-auto min-h-svh max-w-2xl p-4">
      <div className="mb-6 flex items-center gap-2">
        <Link to="/" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
          <ArrowLeft className="size-5" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="font-heading text-2xl font-medium">Settings</h1>
      </div>

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
    </main>
  );
}
