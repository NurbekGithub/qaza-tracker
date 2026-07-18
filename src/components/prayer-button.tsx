import { Check, Clock } from "lucide-react";
import NumberFlow from "@number-flow/react";

import { type TrackableName, trackableName } from "#/lib/prayers";
import { Button } from "#/components/ui/button";

type PrayerButtonProps = {
  prayer: TrackableName;
  count: number;
  isDoneToday: boolean;
  onClick: (prayer: TrackableName) => void;
};

export function PrayerButton({ prayer, count, isDoneToday, onClick }: PrayerButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-between p-3 text-left"
      onClick={() => onClick(prayer)}
    >
      <div className="text-base font-medium">{trackableName(prayer)}</div>

      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold tabular-nums">
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
