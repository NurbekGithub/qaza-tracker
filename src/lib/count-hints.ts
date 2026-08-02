import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

import { isSafarName, SAFAR_PRAYERS, SAFAR_TO_BASE, type TrackableName } from "#/lib/prayers";

export type CountHint =
  | { target: TrackableName; source: TrackableName; kind: "match"; amount: number }
  | { target: TrackableName; source: TrackableName; kind: "subtract" };

type CountValues = Record<TrackableName, number>;

// delta clicking the hint adds to (match) or removes from (subtract) the target;
// subtract = pending safar increase vs the last saved count, minus what the main
// count was already reduced below its saved value (avoids double subtracting)
export function hintDelta(hint: CountHint, values: CountValues, counts: CountValues): number {
  if (hint.kind === "match") return hint.amount - values[hint.target];
  const pending = values[hint.source] - counts[hint.source];
  const alreadyMoved = Math.max(0, counts[hint.target] - values[hint.target]);
  return pending - alreadyMoved;
}

export function hintText(kind: CountHint["kind"], delta: number): string {
  return kind === "match" ? `+${delta}` : `-${delta}`;
}

function deriveHintsOnChange(
  hints: CountHint[],
  values: CountValues,
  counts: CountValues,
  changed: TrackableName,
  nextValue: number,
): CountHint[] {
  const prevValue = values[changed];
  const withoutMine = hints.filter((h) => h.source !== changed && h.target !== changed);
  if (!isSafarName(changed)) return withoutMine;
  const targets: TrackableName[] = [
    SAFAR_TO_BASE[changed],
    ...SAFAR_PRAYERS.filter((q) => q !== changed),
  ];
  const kept = withoutMine.filter((h) => !targets.includes(h.target));
  const subtractHints: CountHint[] =
    nextValue > counts[changed]
      ? [{ target: SAFAR_TO_BASE[changed], source: changed, kind: "subtract" }]
      : [];
  if (nextValue <= prevValue) return [...kept, ...subtractHints];
  const matchHints = SAFAR_PRAYERS.filter(
    (q) => q !== changed && nextValue > values[q],
  ).map<CountHint>((q) => ({ target: q, source: changed, kind: "match", amount: nextValue }));
  return [...kept, ...matchHints, ...subtractHints];
}

export function useCountHints(
  values: CountValues,
  counts: CountValues,
  setValues: Dispatch<SetStateAction<CountValues>>,
) {
  const [hints, setHints] = useState<CountHint[]>([]);

  const activeHints = hints
    .map((hint) => ({ hint, delta: hintDelta(hint, values, counts) }))
    .filter((entry) => entry.delta > 0);

  function handleValueChange(p: TrackableName, nextValue: number) {
    setValues((v) => ({ ...v, [p]: nextValue }));
    setHints((hs) => deriveHintsOnChange(hs, values, counts, p, nextValue));
  }

  function applyHint(hint: CountHint) {
    // match hints increment a safar input, so reuse the same path as typing
    // to derive the corresponding subtract hint on the main counterpart
    if (hint.kind === "match") {
      handleValueChange(hint.target, hint.amount);
      return;
    }
    const delta = hintDelta(hint, values, counts);
    setValues((v) => ({ ...v, [hint.target]: Math.max(0, v[hint.target] - delta) }));
    setHints((hs) => hs.filter((h) => h !== hint));
  }

  const clearHints = useCallback(() => setHints([]), []);

  return { hints: activeHints, handleValueChange, applyHint, clearHints };
}
