import { CircleHelp } from "lucide-react";

import { m } from "#/paraglide/messages";
import { pubertyDate } from "#/lib/qaza-calc";
import { Button } from "#/components/ui/button";
import { QazaDateStep } from "#/components/qaza-date-step";
import type { QazaGender } from "#/components/qaza-gender-step";
import { formatDateLong } from "#/lib/date-utils";

type QazaPubertyStepProps = {
  gender: QazaGender;
  birthDate: Date;
  selected: Date | undefined;
  onSelect: (date: Date | undefined, auto: boolean) => void;
  onNext: () => void;
  onBack: () => void;
};

export function QazaPubertyStep({
  gender,
  birthDate,
  selected,
  onSelect,
  onNext,
  onBack,
}: QazaPubertyStepProps) {
  const autoDate = pubertyDate(birthDate);
  const dateLabel = formatDateLong(autoDate);

  function onUseDate() {
    onSelect(autoDate, true);
  }
  return (
    <>
      <QazaDateStep
        title={m["qaza.puberty.title"]()}
        hint={gender === "female" ? m["qaza.puberty.hint_female"]() : m["qaza.puberty.hint_male"]()}
        selected={selected}
        onSelect={(date) => onSelect(date, false)}
        onNext={onNext}
        onBack={onBack}
        startMonth={birthDate}
        endMonth={new Date()}
        defaultMonth={selected ?? autoDate}
        disabledAfter={new Date()}
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">
            <CircleHelp size={16} className="inline" />{" "}
            {m["qaza.puberty_help.body"]({ date: dateLabel })}
          </div>
          <Button onClick={onUseDate} variant="outline" size="sm">
            {m["qaza.puberty_help.use_date"]({ date: dateLabel })}
          </Button>
        </div>
      </QazaDateStep>
    </>
  );
}
