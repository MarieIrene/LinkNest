import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { APP_NAME } from "./site";

type Email = { to: string; subject: string; text: string; html: string };

let gmail: Transporter | null = null;

/**
 * Sends an email. Uses the first provider that is configured:
 *   1. Gmail: GMAIL_USER + GMAIL_APP_PASSWORD (a Google "app password", not the normal password)
 *   2. Resend: RESEND_API_KEY + EMAIL_FROM
 * With neither (local development) the email is printed to the server terminal instead.
 * Returns false if a configured provider failed to send.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (gmailUser && gmailPassword) {
    try {
      gmail ??= nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPassword },
      });
      await gmail.sendMail({ from: `"${APP_NAME}" <${gmailUser}>`, to: email.to, subject: email.subject, text: email.text, html: email.html });
      return true;
    } catch (err) {
      gmail = null;
      console.error("Gmail send failed. Check GMAIL_USER and GMAIL_APP_PASSWORD.", err);
      return false;
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, html: email.html }),
      });
      if (!res.ok) console.error("Email provider error", res.status, await res.text().catch(() => ""));
      return res.ok;
    } catch (err) {
      console.error("Email send failed", err);
      return false;
    }
  }

  console.info(`\n[email not configured: printing instead]\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}\n`);
  return true;
}
