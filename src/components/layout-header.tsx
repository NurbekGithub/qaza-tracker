import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";
import { LanguageMenuButton } from "#/components/language-menu-button";
import { m } from "#/paraglide/messages";

type LayoutHeaderProps = {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLanguage?: boolean;
  backTo?: string;
};

export function LayoutHeader({
  title,
  showBack,
  showSettings,
  showLanguage,
  backTo,
}: LayoutHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-primary pt-safe text-primary-foreground">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
        {showBack &&
          (backTo ? (
            <Link to={backTo} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <ArrowLeft className="size-5" />
              <span className="sr-only">{m["nav.back"]()}</span>
            </Link>
          ) : (
            <button
              type="button"
              aria-label={m["nav.back"]()}
              onClick={() => router.history.back()}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <ArrowLeft className="size-5" />
            </button>
          ))}

        <h1 className="font-heading text-lg font-medium">{title}</h1>

        {showLanguage && <LanguageMenuButton />}
        {showSettings && (
          <Link
            to="/settings"
            className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "ml-auto" })}
          >
            <Settings className="size-5" />
            <span className="sr-only">{m["nav.settings"]()}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
