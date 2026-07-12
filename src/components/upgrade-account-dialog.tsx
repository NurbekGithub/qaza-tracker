import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/components/ui/dialog";
import { UpgradeAccountForm } from "#/components/upgrade-account-form";
import { m } from "#/paraglide/messages";

type UpgradeAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpgradeAccountDialog({ open, onOpenChange }: UpgradeAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogTitle>{m["upgrade.title"]()}</DialogTitle>
        <DialogDescription>{m["upgrade.description"]()}</DialogDescription>
        <div className="pt-2">
          <UpgradeAccountForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
