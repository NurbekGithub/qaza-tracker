import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { NumberInput } from "#/components/ui/number-field";
import { DialogTitle } from "#/components/ui/dialog";

const MIN_DAYS = 3;
const MAX_DAYS = 10;
const DEFAULT_DAYS = 7;

type QazaMenstruationStepProps = {
  days: number | null;
  onDaysChange: (days: number) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function QazaMenstruationStep({
  days,
  onDaysChange,
  onNext,
  onSkip,
  onBack,
}: QazaMenstruationStepProps) {
  const value = days ?? DEFAULT_DAYS;
  const daysValid = value >= MIN_DAYS && value <= MAX_DAYS;
  return (
    <div className="flex flex-col gap-3">
      <DialogTitle>{m["qaza.menstruation.title"]()}</DialogTitle>
      <div className="flex flex-col gap-2">
        <label htmlFor="qaza-menstruation-days" className="text-sm font-medium">
          {m["qaza.menstruation.days_label"]()}
        </label>
        <NumberInput
          id="qaza-menstruation-days"
          min={MIN_DAYS}
          max={MAX_DAYS}
          value={value}
          onValueChange={onDaysChange}
        />
        <p className="text-xs text-muted-foreground">{m["qaza.menstruation.hint"]()}</p>
      </div>
      <p className="text-xs text-muted-foreground">{m["qaza.nifas.note"]()}</p>
      <div className="mt-1 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          {m["qaza.back"]()}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          {m["qaza.skip"]()}
        </Button>
        <Button
          className="flex-1"
          disabled={!daysValid}
          onClick={() => {
            onDaysChange(value);
            onNext();
          }}
        >
          {m["qaza.next"]()}
        </Button>
      </div>
    </div>
  );
}
