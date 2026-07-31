import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { DialogTitle } from "#/components/ui/dialog";

export type QazaGender = "male" | "female";

type QazaGenderStepProps = {
  selected: QazaGender | undefined;
  onSelect: (gender: QazaGender) => void;
  onBack: () => void;
};

export function QazaGenderStep({ selected, onSelect, onBack }: QazaGenderStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <DialogTitle>{m["qaza.gender.title"]()}</DialogTitle>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={selected === "male" ? "default" : "outline"}
          className="h-14 text-base"
          onClick={() => onSelect("male")}
        >
          {m["qaza.gender.male"]()}
        </Button>
        <Button
          variant={selected === "female" ? "default" : "outline"}
          className="h-14 text-base"
          onClick={() => onSelect("female")}
        >
          {m["qaza.gender.female"]()}
        </Button>
      </div>
      <div className="mt-1 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          {m["qaza.back"]()}
        </Button>
      </div>
    </div>
  );
}
