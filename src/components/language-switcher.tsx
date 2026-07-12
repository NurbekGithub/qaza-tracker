import { getLocale, setLocale, locales } from "#/paraglide/runtime";
import { m } from "#/paraglide/messages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

const LABELS: Record<(typeof locales)[number], () => string> = {
  en: () => m["language.en"](),
  kk: () => m["language.kk"](),
};

export function LanguageSwitcher() {
  return (
    <Select
      value={getLocale()}
      onValueChange={(v) => {
        if (v) setLocale(v);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          {(value) => LABELS[(value ?? getLocale()) as (typeof locales)[number]]()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {LABELS[l]()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
