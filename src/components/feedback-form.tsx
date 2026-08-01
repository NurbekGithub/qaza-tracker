import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { m } from "#/paraglide/messages";
import { cn } from "#/lib/utils";
import { db } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";

const SURVEY_ID = import.meta.env.VITE_PUBLIC_POSTHOG_FEEDBACK_SURVEY_ID as string | undefined;

export function FeedbackForm() {
  const posthog = usePostHog();
  const user = db.useUser();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  function handleSubmit() {
    if (rating === 0) return;
    const message = text.trim();
    if (SURVEY_ID) {
      posthog.capture("survey sent", {
        $survey_id: SURVEY_ID,
        $survey_response: `${rating}/5${message ? ` — ${message}` : ""}`,
        feedback_type: "App feedback",
        user_id: user.id,
        user_email: user.email ?? undefined,
      });
    }
    toast.success(m["feedback.thanks"]());
    setRating(0);
    setText("");
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">{m["feedback.title"]()}</h2>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={m["feedback.star_label"]({ n })}
            aria-pressed={n <= rating}
            onClick={() => setRating(n === rating ? 0 : n)}
            className="p-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <Star className={cn("size-8", n <= rating && "fill-primary text-primary")} />
          </button>
        ))}
      </div>
      <Textarea
        className="min-h-48"
        value={text}
        placeholder={m["feedback.placeholder"]()}
        onChange={(event) => setText(event.target.value)}
      />
      <Button onClick={handleSubmit} disabled={rating === 0}>
        {m["feedback.submit"]()}
      </Button>
    </div>
  );
}
