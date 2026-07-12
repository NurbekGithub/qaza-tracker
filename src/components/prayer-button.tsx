import { Check, Clock } from "lucide-react";
import NumberFlow from "@number-flow/react";

import { type PrayerName, prayerName } from "#/lib/prayers";
import { Button } from "#/components/ui/button";

type PrayerButtonProps = {
  prayer: PrayerName;
  count: number;
  isDoneToday: boolean;
  onClick: (prayer: PrayerName) => void;
};

export function PrayerButton({ prayer, count, isDoneToday, onClick }: PrayerButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-between p-4 text-left"
      onClick={() => onClick(prayer)}
    >
      <div className="text-base font-medium">{prayerName(prayer)}</div>

      <div className="flex items-center gap-3">
        <div className="text-3xl font-semibold tabular-nums">
          <NumberFlow value={count} />
        </div>
        {isDoneToday ? (
          <Check className="size-5 text-green-600" />
        ) : (
          <Clock className="size-5 text-muted-foreground" />
        )}
      </div>
    </Button>
  );
}
