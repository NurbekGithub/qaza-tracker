import { useState } from "react";

import { m } from "#/paraglide/messages";
import { ramadanStartsInGregorianYear } from "#/lib/qaza-calc";
import { formatDateLong } from "#/lib/date-utils";
import { Button } from "#/components/ui/button";
import { DialogTitle } from "#/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { cn } from "#/lib/utils";

type QazaFastingStartStepProps = {
  minYear: number;
  maxYear: number;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export function QazaFastingStartStep({
  minYear,
  maxYear,
  selected,
  onSelect,
  onNext,
  onBack,
  onSkip,
}: QazaFastingStartStepProps) {
  const [open, setOpen] = useState(false);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const selectedYear = selected?.getFullYear();
  const ramadans = selectedYear != null ? ramadanStartsInGregorianYear(selectedYear) : [];
  const chosen =
    ramadans.filter((r) => selected != null && r.startDate <= selected).at(-1) ?? ramadans[0];

  function handleSelectRamadan(hijriYear: number) {
    const index = ramadans.findIndex((r) => r.hijriYear === hijriYear);
    if (index < 0 || selectedYear == null) return;
    onSelect(index === 0 ? new Date(selectedYear, 0, 1) : ramadans[index].startDate);
  }

  return (
    <div className="flex flex-col gap-3">
      <DialogTitle>{m["qaza.fasting_start.title"]()}</DialogTitle>
      <Select
        open={open}
        onOpenChange={setOpen}
        value={selectedYear != null ? String(selectedYear) : undefined}
        onValueChange={(v) => onSelect(v == null ? undefined : new Date(Number(v), 0, 1))}
      >
        <SelectTrigger className="h-12 w-full text-base">
          <SelectValue placeholder={m["qaza.fasting_start.hint"]()} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {ramadans.length > 1 ? (
        <Select
          value={chosen ? String(chosen.hijriYear) : undefined}
          onValueChange={(v) => handleSelectRamadan(Number(v))}
        >
          <SelectTrigger className="h-12 w-full text-base">
            <SelectValue placeholder={m["qaza.fasting_start.which"]()} />
          </SelectTrigger>
          <SelectContent>
            {ramadans.map((r) => (
              <SelectItem key={r.hijriYear} value={String(r.hijriYear)}>
                {m["qaza.fasting_start.confirm"]({
                  year: r.hijriYear,
                  date: formatDateLong(r.startDate),
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : ramadans.length === 1 ? (
        <p
          className={cn(
            "text-sm text-muted-foreground transition-opacity",
            selectedYear == null ? "opacity-0" : "opacity-100",
          )}
        >
          {m["qaza.fasting_start.confirm"]({
            year: ramadans[0].hijriYear,
            date: formatDateLong(ramadans[0].startDate),
          })}
        </p>
      ) : null}
      <div className="mt-1 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          {m["qaza.back"]()}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          {m["qaza.skip"]()}
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={selectedYear == null}>
          {m["qaza.next"]()}
        </Button>
      </div>
    </div>
  );
}
