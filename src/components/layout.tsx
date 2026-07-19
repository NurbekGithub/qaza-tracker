import type { ReactNode } from "react";

import { LayoutHeader } from "#/components/layout-header";
import { cn } from "#/lib/utils";

type LayoutProps = {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLanguage?: boolean;
  backTo?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function Layout({
  title,
  showBack,
  showSettings,
  showLanguage,
  backTo,
  footer,
  children,
}: LayoutProps) {
  return (
    <div className="h-app flex flex-col">
      <LayoutHeader
        title={title}
        showBack={showBack}
        showSettings={showSettings}
        showLanguage={showLanguage}
        backTo={backTo}
      />
      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <div
          aria-hidden
          className="ornament-mask pointer-events-none absolute inset-y-0 left-0 w-1/4 max-w-24 bg-primary opacity-[0.07]"
        />
        <main className={cn("relative flex-1 overflow-y-auto p-4", !footer && "pb-safe-md")}>
          {children}
        </main>
      </div>
      {footer && (
        <footer className="shrink-0 border-t border-border bg-background pb-safe">
          <div className="mx-auto max-w-2xl">{footer}</div>
        </footer>
      )}
    </div>
  );
}
