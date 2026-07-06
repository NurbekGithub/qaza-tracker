import { AccountButton } from "#/components/account-button";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/components/ui/dialog";
import { Check, Clock, Minus, Plus } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

const PRAYERS = ["fajr", "zukhr", "asr", "magrib", "isha", "wajib"] as const;

type Prayer = (typeof PRAYERS)[number];

const DEFAULT_COUNT = 1000;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function Home() {
  const [counts, setCounts] = useState<Record<Prayer, number>>(() =>
    PRAYERS.reduce((acc, p) => ({ ...acc, [p]: DEFAULT_COUNT }), {} as Record<Prayer, number>),
  );
  const [doneDates, setDoneDates] = useState<Record<Prayer, string | null>>(() =>
    PRAYERS.reduce((acc, p) => ({ ...acc, [p]: null }), {} as Record<Prayer, string | null>),
  );
  const [selected, setSelected] = useState<Prayer | null>(null);

  const today = todayKey();

  function isDoneToday(p: Prayer) {
    return doneDates[p] === today;
  }

  function increase(p: Prayer) {
    setCounts((c) => ({ ...c, [p]: c[p] + 1 }));
  }

  function decrease(p: Prayer) {
    setCounts((c) => ({ ...c, [p]: Math.max(0, c[p] - 1) }));
    setDoneDates((d) => ({ ...d, [p]: today }));
  }

  return (
    <main className="mx-auto min-h-svh max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium">Qaza tracker</h1>
        <AccountButton />
      </div>
      <div className="flex flex-col gap-3">
        {PRAYERS.map((p) => {
          const done = isDoneToday(p);
          return (
            <Button
              key={p}
              variant="outline"
              className="h-auto w-full justify-between p-4 text-left"
              onClick={() => setSelected(p)}
            >
              <div className="flex flex-col items-start gap-0.5">
                <div className="text-base font-medium capitalize">{p}</div>
                <div className="text-xs text-muted-foreground">
                  {done ? "Done today" : "Pending"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-semibold tabular-nums">{counts[p]}</div>
                {done ? (
                  <Check className="size-5 text-green-600" />
                ) : (
                  <Clock className="size-5 text-muted-foreground" />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          showCloseButton
          className="top-auto left-0 right-0 bottom-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-xl p-0 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom"
        >
          <div className="p-6 pb-4">
            <DialogTitle className="capitalize">{selected ?? ""}</DialogTitle>
            <DialogDescription>
              {selected && isDoneToday(selected) ? "Done today" : "Pending today"}
            </DialogDescription>
            <div className="mt-2 text-5xl font-semibold tabular-nums">
              {selected ? counts[selected] : 0}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden border-t bg-border">
            <Button
              variant="ghost"
              className="h-20 rounded-none bg-red-600 text-xl font-semibold text-white hover:bg-red-700"
              onClick={() => selected && increase(selected)}
            >
              <Plus className="size-5" />
              Increase
            </Button>
            <Button
              variant="ghost"
              className="h-20 rounded-none bg-green-600 text-xl font-semibold text-white hover:bg-green-700"
              onClick={() => selected && decrease(selected)}
              disabled={selected ? counts[selected] <= 0 : true}
            >
              <Minus className="size-5" />
              Decrease
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
