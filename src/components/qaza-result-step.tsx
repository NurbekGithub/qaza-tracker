import { parseISO } from "date-fns";

import { m } from "#/paraglide/messages";
import { formatDateLong } from "#/lib/date-utils";
import { PRAYERS, prayerName } from "#/lib/prayers";
import { computeFastingQaza, computePrayerQaza } from "#/lib/qaza-calc";
import { Button } from "#/components/ui/button";
import { DialogTitle } from "#/components/ui/dialog";
import type { QazaGender } from "#/components/qaza-gender-step";

export type QazaCalcResult = { prayerCount: number; fastingCount: number | null };

type QazaResultStepProps = {
  gender: QazaGender;
  pubertyDate: Date;
  prayerStartDate: Date;
  menstruationDays: number | null;
  fastingStartDate: Date | undefined;
  onApply: (result: QazaCalcResult) => void;
  onBack: () => void;
};

export function QazaResultStep({
  gender,
  pubertyDate,
  prayerStartDate,
  menstruationDays,
  fastingStartDate,
  onApply,
  onBack,
}: QazaResultStepProps) {
  const menstruating = menstruationDays != null;
  const prayer = computePrayerQaza({
    pubertyDate,
    prayerStartDate,
    menstruationDaysPerMonth: menstruationDays,
  });
  const fasting = fastingStartDate ? computeFastingQaza({ pubertyDate, fastingStartDate }) : null;
  return (
    <div className="flex flex-col gap-4">
      <DialogTitle>{m["qaza.result.title"]()}</DialogTitle>
      <section className="flex flex-col gap-1.5">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["qaza.result.prayer_section"]()}
        </h3>
        {menstruating ? (
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{m["qaza.result.menstruation_minus"]()}</span>
            <span className="tabular-nums">−{prayer.menstruationAdjustment}</span>
          </div>
        ) : null}
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
          {PRAYERS.map((p) => (
            <div key={p} className="flex justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{prayerName(p)}</span>
              <span className="tabular-nums">{prayer.finalDays}</span>
            </div>
          ))}
        </div>
      </section>
      {fasting ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {m["qaza.result.fasting_section"]()}
          </h3>
          {fasting.ramadans.length === 0 ? (
            <p className="text-sm text-muted-foreground">{m["qaza.result.no_fasting"]()}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{m["qaza.result.ramadans_missed"]()}</p>
              {fasting.ramadans.map((r) => (
                <div
                  key={r.hijriYear}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span>
                    {m["qaza.result.ramadan_row"]({ year: r.hijriYear, days: r.days })}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDateLong(parseISO(r.startDate))}
                    </span>
                  </span>
                  <span className="tabular-nums">{r.days}</span>
                </div>
              ))}
              <div className="flex justify-between gap-3 text-sm font-medium">
                <span>{m["qaza.result.fasting_total"]()}</span>
                <span className="tabular-nums">{fasting.totalDays}</span>
              </div>
            </>
          )}
        </section>
      ) : null}
      {gender === "female" ? (
        <p className="text-xs text-muted-foreground">{m["qaza.result.nifas_reminder"]()}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">{m["qaza.result.disclaimer"]()}</p>
      <div className="mt-1 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          {m["qaza.back"]()}
        </Button>
        <Button
          className="flex-1"
          onClick={() =>
            onApply({ prayerCount: prayer.finalDays, fastingCount: fasting?.totalDays ?? null })
          }
        >
          {m["qaza.result.apply"]()}
        </Button>
      </div>
    </div>
  );
}
