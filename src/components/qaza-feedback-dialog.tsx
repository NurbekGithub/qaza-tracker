import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { toast } from "sonner";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";
import type { WizardStep } from "#/components/qaza-calc-dialog";

const SURVEY_ID = import.meta.env.VITE_PUBLIC_POSTHOG_FEEDBACK_SURVEY_ID as string | undefined;

type QazaFeedbackDialogProps = {
  step: WizardStep;
};

export function QazaFeedbackDialog({ step }: QazaFeedbackDialogProps) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function handleSubmit() {
    const message = text.trim();
    if (!message) return;
    if (SURVEY_ID) {
      posthog.capture("survey sent", {
        $survey_id: SURVEY_ID,
        $survey_response: message,
        step,
      });
    }
    toast.success(m["qaza.feedback.thanks"]());
    setText("");
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="link"
        className="mb-2 h-auto w-fit p-0 text-xs font-normal text-muted-foreground underline hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        {m["qaza.feedback.trigger"]()}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{m["qaza.feedback.title"]()}</DialogTitle>
          <Textarea
            rows={4}
            value={text}
            placeholder={m["qaza.feedback.placeholder"]()}
            onChange={(event) => setText(event.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!text.trim()}>
            {m["qaza.feedback.submit"]()}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
