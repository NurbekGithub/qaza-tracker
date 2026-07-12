import { GoogleSignInButton } from "#/components/google-sign-in-button";
import { EmailSignInForm } from "#/components/email-sign-in-form";
import { GOOGLE_CLIENT_ID } from "#/constants";

type UpgradeAccountFormProps = {
  onSuccess: () => void;
};

export function UpgradeAccountForm({ onSuccess }: UpgradeAccountFormProps) {
  const emailForm = <EmailSignInForm onSuccess={onSuccess} />;

  if (!GOOGLE_CLIENT_ID) {
    return emailForm;
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleSignInButton onSuccess={onSuccess} />
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {emailForm}
    </div>
  );
}
