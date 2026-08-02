import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { type TrackableName, trackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import NumberFlow from "@number-flow/react";

const STEPS = [1, 3, 5, 10];

type PrayerCounterDialogProps = {
  prayer: TrackableName | null;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncrease: (prayer: TrackableName, delta: number) => void;
  onDecrease: (prayer: TrackableName, delta: number) => void;
};

export function PrayerCounterDialog({
  prayer,
  count,
  open,
  onOpenChange,
  onIncrease,
  onDecrease,
}: PrayerCounterDialogProps) {
  const [step, setStep] = useState(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="top-auto left-0 right-0 bottom-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-xl p-0 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:top-1/2 sm:left-1/2 sm:right-auto sm:bottom-auto sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6"
      >
        <div className="p-6 pb-4">
          <DialogTitle>{prayer ? trackableName(prayer) : ""}</DialogTitle>
          <p className="mt-2 text-5xl font-semibold tabular-nums">
            <NumberFlow value={count} />
          </p>
          <div className="mt-4 flex gap-2">
            {STEPS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={step === s ? "default" : "outline"}
                className="flex-1"
                onClick={() => setStep(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden border-t bg-border">
          <Button
            variant="ghost"
            className="h-20 rounded-none bg-red-500 text-xl font-semibold text-white hover:bg-red-600"
            onClick={() => prayer && onIncrease(prayer, step)}
          >
            <Plus className="size-5" />
            {m["dialog.increase"]()}
          </Button>
          <Button
            variant="ghost"
            className="h-20 rounded-none bg-emerald-500 text-xl font-semibold text-white hover:bg-emerald-600"
            onClick={() => prayer && onDecrease(prayer, step)}
            disabled={count <= 0}
          >
            <Minus className="size-5" />
            {m["dialog.decrease"]()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
