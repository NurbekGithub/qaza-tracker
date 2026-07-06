import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/components/ui/dialog";
import { UpgradeAccountForm } from "#/components/upgrade-account-form";

type UpgradeAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function UpgradeAccountDialog({ open, onOpenChange }: UpgradeAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogTitle>Link your account</DialogTitle>
        <DialogDescription>
          Save your data so you can access it from other devices.
        </DialogDescription>
        <div className="pt-2">
          <UpgradeAccountForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { UpgradeAccountDialog };
