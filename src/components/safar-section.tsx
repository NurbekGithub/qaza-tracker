import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { m } from "#/paraglide/messages";
import { cn } from "#/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#/components/ui/collapsible";

type SafarSectionProps = {
  total: number;
  children: React.ReactNode;
};

// this is so safar collapsable opens after calculation if safar prayers are present
function useReopenLogicIfTotalChangesToPositive(total: number, open: () => void) {
  const prevTotal = useRef(total);
  useEffect(() => {
    const prev = prevTotal.current;
    prevTotal.current = total;
    if (prev === 0 && total > 0) open();
  }, [total]);
}

export function SafarSection({ total, children }: SafarSectionProps) {
  const [open, setOpen] = useState(total > 0);
  useReopenLogicIfTotalChangesToPositive(total, () => setOpen(true));

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["home.safar_title"]()}
        </span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}
