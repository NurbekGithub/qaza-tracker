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
    <div className="flex h-full flex-col">
      <LayoutHeader
        title={title}
        showBack={showBack}
        showSettings={showSettings}
        showLanguage={showLanguage}
        backTo={backTo}
      />
      <main
        className={cn(
          "mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-4",
          !footer && "pb-safe-md",
        )}
      >
        {children}
      </main>
      {footer && (
        <footer className="shrink-0 border-t border-border bg-background pb-safe">
          <div className="mx-auto max-w-2xl">{footer}</div>
        </footer>
      )}
    </div>
  );
}
