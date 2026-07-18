import { Monitor, Moon, Sun } from "lucide-react";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import { useTheme, type Theme } from "#/components/theme-provider";
import { buttonVariants } from "#/components/ui/button";
import { SelectContent, SelectItem } from "#/components/ui/select";
import { m } from "#/paraglide/messages";

const OPTIONS: Array<{
  value: Theme;
  icon: typeof Sun;
  label: () => string;
}> = [
  { value: "light", icon: Sun, label: () => m["theme.light"]() },
  { value: "dark", icon: Moon, label: () => m["theme.dark"]() },
  { value: "system", icon: Monitor, label: () => m["theme.system"]() },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <SelectPrimitive.Root
      value={theme}
      onValueChange={(v) => {
        if (v) setTheme(v as Theme);
      }}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label={m["settings.theme"]()}
      >
        <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </SelectPrimitive.Trigger>
      <SelectContent>
        {OPTIONS.map(({ value, icon: Icon, label }) => (
          <SelectItem key={value} value={value}>
            <Icon className="size-4" />
            {label()}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}
