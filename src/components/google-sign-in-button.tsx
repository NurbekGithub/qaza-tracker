import { useMemo, useState } from "react";
import { useAsyncFn } from "react-use";
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";

import { db } from "#/lib/db";
import { extractError } from "#/lib/error-utils";
import { usePostHog } from "@posthog/react";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_NAME } from "#/constants";

type GoogleSignInButtonProps = {
  onSuccess: () => void;
};

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const posthog = usePostHog();
  const nonce = useMemo(() => crypto.randomUUID(), []);
  const [popupError, setPopupError] = useState<string | null>(null);

  const [state, handleCredential] = useAsyncFn(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
        throw new Error("Google sign-in failed. Please try again.");
      }
      try {
        await db.auth.signInWithIdToken({
          clientName: GOOGLE_CLIENT_NAME,
          idToken: credentialResponse.credential,
          nonce,
        });
        posthog.capture("account_linked");
        posthog.identify(nonce);
        onSuccess();
      } catch (err) {
        posthog.captureException(err);
        throw new Error(extractError(err));
      }
    },
    [nonce, onSuccess, posthog],
  );

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_NAME) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col gap-2">
        <GoogleLogin
          nonce={nonce}
          onSuccess={handleCredential}
          onError={() => {
            setPopupError("Google sign-in failed. Please try again.");
          }}
          text="continue_with"
          shape="rectangular"
          size="large"
          width="320"
        />
        {/* state.error: credential handler error after a successful popup. */}
        {state.error && <p className="text-sm text-red-600">{state.error.message}</p>}
        {/* Popup-level error: Google popup closed/failed (async handler never runs). */}
        {popupError && <p className="text-sm text-red-600">{popupError}</p>}
      </div>
    </GoogleOAuthProvider>
  );
}
