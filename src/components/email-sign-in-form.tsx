import { useState } from "react";
import { useAsyncFn } from "react-use";

import { db } from "#/lib/db";
import { extractError } from "#/lib/error-utils";
import { m } from "#/paraglide/messages";
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
        <p className="text-sm text-muted-foreground">{m["email.intro"]()}</p>
        <Input
          name="email"
          type="email"
          placeholder={m["email.placeholder"]()}
          required
          autoFocus
        />
        {requestState.error && (
          <p className="text-sm text-red-600">{extractError(requestState.error)}</p>
        )}
        <Button type="submit" disabled={requestState.loading}>
          {requestState.loading ? m["email.sending"]() : m["email.send"]()}
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
      <p className="text-sm text-muted-foreground">{m["email.code_sent"]({ email: sentEmail })}</p>
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
        {verifyState.loading ? m["email.verifying"]() : m["email.verify"]()}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setSentEmail("");
          setCode("");
        }}
      >
        {m["email.use_different"]()}
      </Button>
    </form>
  );
}
