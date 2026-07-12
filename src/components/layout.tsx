import type { ReactNode } from "react";

import { LayoutHeader } from "#/components/layout-header";

type LayoutProps = {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLanguage?: boolean;
  backTo?: string;
  children: ReactNode;
};

export function Layout({
  title,
  showBack,
  showSettings,
  showLanguage,
  backTo,
  children,
}: LayoutProps) {
  return (
    <div className="min-h-svh">
      <LayoutHeader
        title={title}
        showBack={showBack}
        showSettings={showSettings}
        showLanguage={showLanguage}
        backTo={backTo}
      />
      <main className="mx-auto max-w-2xl p-4">{children}</main>
    </div>
  );
}
