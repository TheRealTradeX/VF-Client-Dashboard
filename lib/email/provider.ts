import "server-only";

type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export type EmailSendResult =
  | { ok: true; provider: "test" | "resend"; id?: string }
  | { ok: false; provider: "test" | "resend"; error: string };

const isProd = process.env.VERCEL_ENV === "production";

export async function sendEmail(payload: SendEmailPayload): Promise<EmailSendResult> {
  if (!isProd) {
    return { ok: true, provider: "test" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey || !from) {
    return { ok: false, provider: "resend", error: "Missing RESEND_API_KEY or RESEND_FROM." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      provider: "resend",
      error: `Resend error (${response.status}): ${body}`,
    };
  }

  let id: string | undefined;
  try {
    const data = (await response.json()) as { id?: string };
    if (data?.id) id = data.id;
  } catch {}

  return { ok: true, provider: "resend", id };
}
