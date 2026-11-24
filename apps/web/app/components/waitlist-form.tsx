"use client";

import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function WaitlistForm() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, company, email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        setError(data?.error === "Invalid email address" ? "Please enter a valid email address." : "Please check your details and try again.");
      } else {
        setError("Something went wrong. Please try again in a moment.");
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-ink">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-xl text-brand">
          ✓
        </div>
        <p className="mt-4 text-lg font-semibold">You&apos;re on the list.</p>
        <p className="mt-2 text-ink-soft">Thanks for signing up — we&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 text-ink sm:p-8">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="company" className="text-sm font-medium">
          Company <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Join Waitlist / Request Early Access"}
      </button>
      <p className="text-center text-xs text-muted">We&apos;ll only use your details to contact you about early access.</p>
    </form>
  );
}
