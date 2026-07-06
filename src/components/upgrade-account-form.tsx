import { useState } from "react";

import { db } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { usePostHog } from "@posthog/react";

type UpgradeAccountFormProps = {
  onSuccess: () => void;
};

function UpgradeAccountForm({ onSuccess }: UpgradeAccountFormProps) {
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();

  if (!sentEmail) {
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "");
      if (!email) return;
      setError(null);
      setSubmitting(true);
      try {
        await db.auth.sendMagicCode({ email });
        setSentEmail(email);
        posthog.capture("magic_code_requested");
      } catch (err) {
        setError(extractError(err));
        posthog.captureException(err);
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a verification code. Your guest data will be linked
          to this account.
        </p>
        <Input name="email" type="email" placeholder="you@example.com" required autoFocus />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      posthog.capture("account_linked");
      posthog.identify(sentEmail);
      onSuccess();
    } catch (err) {
      setError(extractError(err));
      setCode("");
      posthog.captureException(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleVerify}>
      <p className="text-sm text-muted-foreground">
        We sent a code to <strong>{sentEmail}</strong>. Enter it below to link your account.
      </p>
      <Input
        name="code"
        type="text"
        inputMode="numeric"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        autoFocus
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Verifying…" : "Verify code"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setSentEmail("");
          setCode("");
          setError(null);
        }}
      >
        Use a different email
      </Button>
    </form>
  );
}

function extractError(err: unknown): string {
  const message =
    err && typeof err === "object" && "body" in err
      ? (err as { body?: { message?: string } }).body?.message
      : undefined;
  return message ?? "Something went wrong. Please try again.";
}

export { UpgradeAccountForm };
