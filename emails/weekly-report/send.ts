export type EmailPayload = {
  subject: string;
  html: string;
  text: string;
};

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Qaza Tracker <onboarding@resend.dev>";
}

export async function sendEmail(to: string, payload: EmailPayload): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return (await res.json()) as { id: string };
}
