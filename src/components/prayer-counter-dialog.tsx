import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { swipeGroup, trackableName, type TrackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { SwipeableSlides } from "#/components/swipeable-slides";
import NumberFlow from "@number-flow/react";

const STEPS = [1, 3, 5, 10];

type PrayerCounterDialogProps = {
  prayer: TrackableName | null;
  counts: Record<TrackableName, number>;
  open: boolean;
  swipeable?: boolean;
  onOpenChange: (open: boolean) => void;
  onIncrease: (prayer: TrackableName, delta: number) => void;
  onDecrease: (prayer: TrackableName, delta: number) => void;
  onNavigate: (prayer: TrackableName) => void;
};

export function PrayerCounterDialog({
  prayer,
  counts,
  open,
  swipeable = true,
  onOpenChange,
  onIncrease,
  onDecrease,
  onNavigate,
}: PrayerCounterDialogProps) {
  const [step, setStep] = useState(1);
  const [index, setIndex] = useState(0);

  const group = useMemo(() => (prayer ? swipeGroup(prayer) : []), [prayer]);

  useEffect(() => {
    setIndex(prayer ? Math.max(0, group.indexOf(prayer)) : 0);
  }, [prayer, group]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="top-auto left-0 right-0 bottom-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-xl p-0 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:top-1/2 sm:left-1/2 sm:right-auto sm:bottom-auto sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-0"
      >
        <SwipeableSlides
          index={index}
          onIndexChange={(i) => {
            setIndex(i);
            onNavigate(group[i]);
          }}
          disabled={!swipeable}
        >
          {group.map((p) => (
            <div key={p}>
              <div className="p-6 pb-4">
                <DialogTitle>{trackableName(p)}</DialogTitle>
                <p className="mt-2 text-5xl font-semibold tabular-nums">
                  <NumberFlow value={counts[p]} />
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
                  onClick={() => onIncrease(p, step)}
                >
                  <Plus className="size-5" />
                  {m["dialog.increase"]()}
                </Button>
                <Button
                  variant="ghost"
                  className="h-20 rounded-none bg-emerald-500 text-xl font-semibold text-white hover:bg-emerald-600"
                  onClick={() => onDecrease(p, step)}
                  disabled={counts[p] <= 0}
                >
                  <Minus className="size-5" />
                  {m["dialog.decrease"]()}
                </Button>
              </div>
            </div>
          ))}
        </SwipeableSlides>
      </DialogContent>
    </Dialog>
  );
}
