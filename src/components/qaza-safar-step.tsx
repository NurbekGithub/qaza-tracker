import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { DialogTitle } from "#/components/ui/dialog";

type QazaSafarStepProps = {
  days: number | null;
  maxDays: number;
  onDaysChange: (days: number) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function QazaSafarStep({
  days,
  maxDays,
  onDaysChange,
  onNext,
  onSkip,
  onBack,
}: QazaSafarStepProps) {
  const value = days ?? 0;
  const daysValid = value >= 0 && value <= maxDays;
  return (
    <div className="flex flex-col gap-3">
      <DialogTitle>{m["qaza.safar.title"]()}</DialogTitle>
      <div className="flex flex-col gap-2">
        <label htmlFor="qaza-safar-days" className="text-sm font-medium">
          {m["qaza.safar.days_label"]()}
        </label>
        <Input
          id="qaza-safar-days"
          type="number"
          min={0}
          max={maxDays}
          inputMode="numeric"
          className="w-24 text-right tabular-nums"
          placeholder="0"
          value={value === 0 ? "" : value}
          onChange={(e) => onDaysChange(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">{m["qaza.safar.hint"]()}</p>
      </div>
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
