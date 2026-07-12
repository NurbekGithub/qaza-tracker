import type { ReactNode } from "react";

import { LayoutHeader } from "#/components/layout-header";

type LayoutProps = {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  backTo?: string;
  children: ReactNode;
};

export function Layout({ title, showBack, showSettings, backTo, children }: LayoutProps) {
  return (
    <div className="min-h-svh">
      <LayoutHeader title={title} showBack={showBack} showSettings={showSettings} backTo={backTo} />
      <main className="mx-auto max-w-2xl p-4 pb-safe-md">{children}</main>
    </div>
  );
}
