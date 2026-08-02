import { Globe } from "lucide-react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { getLocale, setLocale, locales } from "#/paraglide/runtime";
import { m } from "#/paraglide/messages";
import { buttonVariants } from "#/components/ui/button";
import { SelectContent, SelectItem } from "#/components/ui/select";
import { db } from "#/lib/db";
import { saveLocalePref } from "#/lib/locale-prefs";

const LABELS: Record<(typeof locales)[number], () => string> = {
  en: () => m["language.en"](),
  kk: () => m["language.kk"](),
};

export function LanguageMenuButton() {
  const { user } = db.useAuth();
  return (
    <SelectPrimitive.Root
      value={getLocale()}
      onValueChange={(v) => {
        if (!v) return;
        setLocale(v);
        if (user) saveLocalePref(user.id, v);
      }}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "ml-auto" })}
        aria-label={m["settings.language"]()}
      >
        <Globe className="size-5" />
      </SelectPrimitive.Trigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {LABELS[l]()}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}
