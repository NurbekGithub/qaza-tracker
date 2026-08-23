import nodemailer from "nodemailer";

export type EmailPayload = {
  subject: string;
  html: string;
  text: string;
};

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Qaza Tracker";
}

export async function sendEmail(to: string, payload: EmailPayload): Promise<{ id: string }> {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: appPassword },
  });
  const info = await transporter.sendMail({
    from: `${getEmailFrom()} <${user}>`,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  return { id: info.messageId };
}
