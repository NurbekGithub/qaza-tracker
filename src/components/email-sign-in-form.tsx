import { useState } from "react";
import { useAsyncFn } from "react-use";

import { db } from "#/lib/db";
import { extractError } from "#/lib/error-utils";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { usePostHog } from "@posthog/react";

type EmailSignInFormProps = {
  onSuccess: () => void;
};

export function EmailSignInForm({ onSuccess }: EmailSignInFormProps) {
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const posthog = usePostHog();

  const [requestState, requestCode] = useAsyncFn(
    async (email: string) => {
      try {
        await db.auth.sendMagicCode({ email });
        setSentEmail(email);
        posthog.capture("magic_code_requested");
      } catch (err) {
        posthog.captureException(err);
        throw err;
      }
    },
    [posthog],
  );

  const [verifyState, verifyCode] = useAsyncFn(async () => {
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      posthog.capture("account_linked");
      posthog.identify(sentEmail);
      onSuccess();
    } catch (err) {
      posthog.captureException(err);
      setCode("");
      throw err;
    }
  }, [sentEmail, code, onSuccess, posthog]);

  if (!sentEmail) {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "");
      if (!email) return;
      requestCode(email);
    }

    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a verification code. Your guest data will be linked
          to this account.
        </p>
        <Input name="email" type="email" placeholder="you@example.com" required autoFocus />
        {requestState.error && (
          <p className="text-sm text-red-600">{extractError(requestState.error)}</p>
        )}
        <Button type="submit" disabled={requestState.loading}>
          {requestState.loading ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verifyCode();
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
      {verifyState.error && (
        <p className="text-sm text-red-600">{extractError(verifyState.error)}</p>
      )}
      <Button type="submit" disabled={verifyState.loading}>
        {verifyState.loading ? "Verifying…" : "Verify code"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setSentEmail("");
          setCode("");
        }}
      >
        Use a different email
      </Button>
    </form>
  );
}
