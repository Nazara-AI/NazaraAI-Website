import { Resend } from "resend";
import { NextResponse } from "next/server";

const SHEETS_WEBHOOK = "https://script.google.com/macros/s/AKfycbwj0zLXFhDwW-QwHUllfxd4faPjrcBv7waGnX1FS8J0d1RP1nGXj_hI7irClbBkXMy8iA/exec";

const MAX_BODY_BYTES = 4_096;
const LIMITS = { fullName: 120, company: 160, email: 254 } as const;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

type Signup = { fullName: string; company: string; email: string };

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Trim, collapse control characters (incl. CR/LF) to spaces. */
function clean(value: unknown): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Stop spreadsheet apps from treating a value as a formula. */
function sheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function parseSignup(body: unknown): Signup | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Invalid request body";
  const raw = body as Record<string, unknown>;

  const fullName = clean(raw.fullName);
  const company = clean(raw.company);
  const email = clean(raw.email);

  if (fullName === null || company === null || email === null) return "Invalid field type";
  if (!fullName || !email) return "Missing required fields";
  if (fullName.length > LIMITS.fullName || company.length > LIMITS.company || email.length > LIMITS.email) {
    return "Field too long";
  }
  if (!EMAIL_RE.test(email)) return "Invalid email address";

  return { fullName, company, email: email.toLowerCase() };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return bad("Request too large", 413);
    body = JSON.parse(text);
  } catch {
    return bad("Invalid JSON");
  }

  const parsed = parseSignup(body);
  if (typeof parsed === "string") return bad(parsed);
  const { fullName, company, email } = parsed;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email notification via Resend (it reports failures in `error`, not by throwing)
    const { error: emailError } = await resend.emails.send({
      from: "Nazara AI Waitlist <onboarding@resend.dev>",
      to: ["chineduobi423@gmail.com"],
      subject: `New Waitlist Signup: ${fullName}`,
      html: `
        <h2>New Early Access Signup</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
      `,
    });
    if (emailError) throw new Error(`Resend: ${emailError.message}`);

    // Log to Google Sheet
    const sheetRes = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        fullName: sheetSafe(fullName),
        company: sheetSafe(company),
        email: sheetSafe(email),
      }),
    });
    if (!sheetRes.ok) throw new Error(`Sheets webhook: HTTP ${sheetRes.status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return bad("Failed to process signup", 500);
  }
}
