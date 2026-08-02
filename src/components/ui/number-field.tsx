import { NumberField } from "@base-ui/react/number-field";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "#/lib/utils";

type NumberInputProps = {
  id?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function NumberInput({
  id,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  className,
  "aria-label": ariaLabel,
}: NumberInputProps) {
  return (
    <NumberField.Root
      id={id}
      className={cn("w-44 shrink-0", className)}
      value={value}
      onValueChange={(v) => onValueChange(v ?? min ?? 0)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      format={{ useGrouping: false }}
    >
      <NumberField.Group
        data-slot="number-input-group"
        className="flex h-10 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
      >
        <NumberField.Input
          aria-label={ariaLabel}
          className="min-w-8 flex-1 bg-transparent px-1 text-center text-base tabular-nums outline-none md:text-sm"
          onFocus={(e) => {
            if (value === 0) e.currentTarget.select();
          }}
        />
        <NumberField.ScrubArea
          direction="vertical"
          className="flex w-10 shrink-0 cursor-ns-resize touch-none select-none items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-scrubbing:bg-muted data-scrubbing:text-foreground"
          aria-hidden
        >
          <ChevronsUpDown className="size-4" />
          <NumberField.ScrubAreaCursor className="text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <ChevronsUpDown className="size-5" />
          </NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>
      </NumberField.Group>
    </NumberField.Root>
  );
}
