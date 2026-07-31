import type { ReactNode } from "react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import { DialogTitle } from "#/components/ui/dialog";
import { getDateFnsLocale } from "#/lib/date-utils";

type QazaDateStepProps = {
  title: string;
  hint?: string;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  startMonth: Date;
  endMonth: Date;
  defaultMonth?: Date;
  disabledAfter?: Date;
  children?: ReactNode;
};

export function QazaDateStep({
  title,
  hint,
  selected,
  onSelect,
  onNext,
  onBack,
  onSkip,
  startMonth,
  endMonth,
  defaultMonth,
  disabledAfter,
  children,
}: QazaDateStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <DialogTitle>{title}</DialogTitle>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        captionLayout="dropdown"
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth ?? selected ?? endMonth}
        disabled={disabledAfter ? { after: disabledAfter } : undefined}
        locale={getDateFnsLocale()}
        className="mx-auto [--cell-size:--spacing(10)] text-base"
      />
      {children}
      <div className="mt-1 flex gap-2">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            {m["qaza.back"]()}
          </Button>
        ) : null}
        {onSkip ? (
          <Button variant="outline" className="flex-1" onClick={onSkip}>
            {m["qaza.skip"]()}
          </Button>
        ) : null}
        <Button className="flex-1" onClick={onNext} disabled={!selected}>
          {m["qaza.next"]()}
        </Button>
      </div>
    </div>
  );
}
