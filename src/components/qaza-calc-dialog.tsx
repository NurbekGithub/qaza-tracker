import { useEffect, useState } from "react";
import { id } from "@instantdb/react";
import { format, parseISO } from "date-fns";

import { db, transact } from "#/lib/db";
import { m } from "#/paraglide/messages";
import { Dialog, DialogContent } from "#/components/ui/dialog";
import { QazaDateStep } from "#/components/qaza-date-step";
import { QazaFastingStartStep } from "#/components/qaza-fasting-start-step";
import { QazaGenderStep, type QazaGender } from "#/components/qaza-gender-step";
import { QazaPubertyStep } from "#/components/qaza-puberty-step";
import { QazaMenstruationStep } from "#/components/qaza-menstruation-step";
import { QazaSafarStep } from "#/components/qaza-safar-step";
import { QazaResultStep, type QazaCalcResult } from "#/components/qaza-result-step";
import { QazaFeedbackDialog } from "#/components/qaza-feedback-dialog";
import { computePrayerQaza } from "#/lib/qaza-calc";

export type WizardStep =
  | "birth"
  | "gender"
  | "puberty"
  | "prayerStart"
  | "menstruation"
  | "safar"
  | "fastingStart"
  | "result";

type QazaCalcDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: QazaCalcResult) => void;
};

const EARLIEST_BIRTH_MONTH = new Date(1920, 0, 1);

export function QazaCalcDialog({ open, onOpenChange, onApply }: QazaCalcDialogProps) {
  const { user } = db.useAuth();
  const { isLoading, data } = db.useQuery(
    user ? { qazaProfiles: { $: { where: { ownerId: user.id } } } } : null,
  );
  const profile = data?.qazaProfiles[0];

  const [step, setStep] = useState<WizardStep>("birth");
  const [birthDate, setBirthDate] = useState<Date>();
  const [gender, setGender] = useState<QazaGender>();
  const [puberty, setPuberty] = useState<Date>();
  const [pubertyAuto, setPubertyAuto] = useState(false);
  const [prayerStart, setPrayerStart] = useState<Date>();
  const [menstruationDays, setMenstruationDays] = useState<number | null>(null);
  const [safarDays, setSafarDays] = useState<number | null>(null);
  const [fastingStart, setFastingStart] = useState<Date>();

  useEffect(() => {
    if (!open || !data) return;
    const p = data.qazaProfiles[0];
    setStep("birth");
    setBirthDate(p?.birthDate ? parseISO(p.birthDate) : undefined);
    setGender(p?.gender === "male" || p?.gender === "female" ? p.gender : undefined);
    setPuberty(p?.pubertyDate ? parseISO(p.pubertyDate) : undefined);
    setPubertyAuto(p?.pubertyAuto ?? false);
    setPrayerStart(p?.prayerStartDate ? parseISO(p.prayerStartDate) : undefined);
    setMenstruationDays(p?.menstruationDays ?? null);
    setSafarDays(p?.safarDays ?? null);
    setFastingStart(p?.fastingStartDate ? parseISO(p.fastingStartDate) : undefined);
  }, [open, data]);

  function handleApply(result: QazaCalcResult) {
    if (!user || !birthDate || !gender || !puberty || !prayerStart) return;
    transact(
      db.tx.qazaProfiles[profile?.id ?? id()].update({
        ownerId: user.id,
        birthDate: format(birthDate, "yyyy-MM-dd"),
        gender,
        pubertyDate: format(puberty, "yyyy-MM-dd"),
        pubertyAuto,
        prayerStartDate: format(prayerStart, "yyyy-MM-dd"),
        ...(fastingStart ? { fastingStartDate: format(fastingStart, "yyyy-MM-dd") } : {}),
        ...(gender === "female" && menstruationDays != null ? { menstruationDays } : {}),
        ...(safarDays != null ? { safarDays } : {}),
        updatedAt: Date.now(),
      }),
    );
    onApply(result);
    onOpenChange(false);
  }

  const today = new Date();
  const pubertyYear = puberty ? puberty.getFullYear() : today.getFullYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent
        showCloseButton
        className="top-auto right-0 bottom-0 left-0 max-h-[85dvh] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-t-xl rounded-b-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{m["state.loading"]()}</p>
        ) : (
          <>
            <QazaFeedbackDialog step={step} />
            {step === "birth" && (
              <QazaDateStep
                title={m["qaza.birth.title"]()}
                selected={birthDate}
                onSelect={setBirthDate}
                onNext={() => setStep("gender")}
                startMonth={EARLIEST_BIRTH_MONTH}
                endMonth={today}
                disabledAfter={today}
              />
            )}
            {step === "gender" && (
              <QazaGenderStep
                selected={gender}
                onSelect={(g) => {
                  setGender(g);
                  setStep("puberty");
                }}
                onBack={() => setStep("birth")}
              />
            )}
            {step === "puberty" && birthDate && gender && (
              <QazaPubertyStep
                gender={gender}
                birthDate={birthDate}
                selected={puberty}
                onSelect={(date, auto) => {
                  setPuberty(date);
                  setPubertyAuto(auto);
                }}
                onNext={() => setStep("prayerStart")}
                onBack={() => setStep("gender")}
              />
            )}
            {step === "prayerStart" && puberty && (
              <QazaDateStep
                title={m["qaza.prayer_start.title"]()}
                selected={prayerStart}
                onSelect={setPrayerStart}
                onNext={() => setStep(gender === "female" ? "menstruation" : "safar")}
                onBack={() => setStep("puberty")}
                startMonth={puberty}
                endMonth={today}
                disabledAfter={today}
              />
            )}
            {step === "menstruation" && gender === "female" && (
              <QazaMenstruationStep
                days={menstruationDays}
                onDaysChange={setMenstruationDays}
                onNext={() => setStep("safar")}
                onSkip={() => {
                  setMenstruationDays(null);
                  setStep("safar");
                }}
                onBack={() => setStep("prayerStart")}
              />
            )}
            {step === "safar" && puberty && prayerStart && (
              <QazaSafarStep
                days={safarDays}
                maxDays={
                  computePrayerQaza({
                    pubertyDate: puberty,
                    prayerStartDate: prayerStart,
                    menstruationDaysPerMonth: gender === "female" ? menstruationDays : null,
                  }).finalDays
                }
                onDaysChange={setSafarDays}
                onNext={() => setStep("fastingStart")}
                onSkip={() => {
                  setSafarDays(null);
                  setStep("fastingStart");
                }}
                onBack={() => setStep(gender === "female" ? "menstruation" : "prayerStart")}
              />
            )}
            {step === "fastingStart" && puberty && (
              <QazaFastingStartStep
                minYear={pubertyYear}
                maxYear={today.getFullYear()}
                selected={fastingStart}
                onSelect={setFastingStart}
                onNext={() => setStep("result")}
                onBack={() => setStep("safar")}
                onSkip={() => {
                  setFastingStart(undefined);
                  setStep("result");
                }}
              />
            )}
            {step === "result" && gender && puberty && prayerStart && (
              <QazaResultStep
                gender={gender}
                pubertyDate={puberty}
                prayerStartDate={prayerStart}
                menstruationDays={gender === "female" ? menstruationDays : null}
                safarDays={safarDays}
                fastingStartDate={fastingStart}
                onApply={handleApply}
                onBack={() => setStep("fastingStart")}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
