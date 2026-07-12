import { ShareIcon, PlusIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { m } from "#/paraglide/messages";

type InstallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InstallDialog({ open, onOpenChange }: InstallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogTitle>{m["install.ios_title"]()}</DialogTitle>
        <DialogDescription>{m["install.ios_body"]()}</DialogDescription>

        <ol className="mt-2 space-y-3">
          <li className="flex items-center gap-3 text-sm">
            <ShareIcon className="size-4 shrink-0" />
            <span>{m["install.ios_step_share"]()}</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <PlusIcon className="size-4 shrink-0" />
            <span>{m["install.ios_step_add"]()}</span>
          </li>
        </ol>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {m["install.ios_dismiss"]()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
