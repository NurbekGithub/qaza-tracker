import { Input } from "#/components/ui/input";
import { type CountHint, hintText } from "#/lib/count-hints";
import { trackableName, type TrackableName } from "#/lib/prayers";
import { cn } from "#/lib/utils";

type CountRowHint = {
  kind: CountHint["kind"];
  delta: number;
  onClick: () => void;
};

type CountRowProps = {
  trackable: TrackableName;
  value: number;
  hint?: CountRowHint;
  onChange: (trackable: TrackableName, value: number) => void;
};

export function CountRow({ trackable, value, hint, onChange }: CountRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={`trackable-${trackable}`} className="text-base font-medium">
        {trackableName(trackable)}
      </label>
      <div className="flex items-center gap-2">
        {hint && (
          <button
            type="button"
            aria-label={`${trackableName(trackable)} ${hintText(hint.kind, hint.delta)}`}
            onClick={hint.onClick}
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums animate-in fade-in zoom-in-95",
              hint.kind === "match"
                ? "bg-rose-600/10 text-rose-600 hover:bg-rose-600/20"
                : "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20",
            )}
          >
            {hintText(hint.kind, hint.delta)}
          </button>
        )}
        <Input
          id={`trackable-${trackable}`}
          type="number"
          min={0}
          inputMode="numeric"
          className="w-24 text-right tabular-nums"
          placeholder="0"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(trackable, Number(e.target.value))}
        />
      </div>
    </div>
  );
}
