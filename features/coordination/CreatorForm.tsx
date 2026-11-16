"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
export default function CreatorForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const tracking = useRef<Promise<unknown> | null>(null);
  useEffect(() => {
    if (!tracking.current)
      tracking.current = fetch("/api/creators/visit", { method: "POST" }).catch(
        () => undefined,
      );
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      await tracking.current;
      const data = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rights_confirmed: data.rights_confirmed === "on",
          consent: data.consent === "on",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setFieldErrors(payload);
        throw new Error(
          payload.detail ||
            "Please check the highlighted fields and try again.",
        );
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message || "Unable to submit. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="zc-form zc-confirmation" role="status" tabIndex={-1}>
        <CheckCircle2 size={44} />
        <p className="zc-eyebrow">The next chapter starts here</p>
        <h3>Your story is in the pipeline.</h3>
        <p>
          We’ve received your application. The Zuimi team will review your film
          and contact you using the details you provided.
        </p>
        <p>
          No rights have been transferred. Distribution terms and next steps
          will be discussed separately.
        </p>
        <a href="/" className="zc-cta">
          Back to Zuimi <ArrowUpRight size={16} />
        </a>
      </div>
    );
  return (
    <form className="zc-form" onSubmit={submit}>
      <div className="zc-form-heading">
        <span>01 / Your introduction</span>
        <h3>The person behind the story.</h3>
        <p>Fields are required unless marked optional.</p>
      </div>
      <div className="zc-form-grid">
        <Field
          fieldErrors={fieldErrors}
          name="name"
          title="Full name"
          max={120}
        />
        <Field
          fieldErrors={fieldErrors}
          name="email"
          title="Email address"
          type="email"
          max={254}
        />
        <Field
          fieldErrors={fieldErrors}
          name="phone"
          title="Phone / WhatsApp"
          type="tel"
          required={false}
          max={40}
        />
        <Field
          fieldErrors={fieldErrors}
          name="company"
          title="Company / production house"
          required={false}
        />
        <Field
          fieldErrors={fieldErrors}
          name="country"
          title="Country"
          max={80}
        />
        <Field
          fieldErrors={fieldErrors}
          name="role"
          title="Your role"
          max={80}
          placeholder="Director, producer, rights representative…"
        />
      </div>
      <div className="zc-form-heading">
        <span>02 / Your film</span>
        <h3>Tell us what you’re creating.</h3>
      </div>
      <div className="zc-form-grid">
        <Field
          fieldErrors={fieldErrors}
          name="film_title"
          title="Film title"
          max={240}
        />
        <label className="zc-field">
          Production stage
          <select required name="film_stage" defaultValue="">
            <option value="" disabled>
              Select stage
            </option>
            {[
              "In development",
              "In production",
              "Post-production",
              "Completed",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.film_stage && (
            <small>{String(fieldErrors.film_stage)}</small>
          )}
        </label>
        <Field
          fieldErrors={fieldErrors}
          name="genre"
          title="Genre / format"
          max={100}
          placeholder="Drama, documentary, short film…"
        />
        <Field
          fieldErrors={fieldErrors}
          name="portfolio_url"
          title="Portfolio / trailer link"
          type="url"
          required={false}
          max={1000}
          placeholder="https://…"
        />
      </div>
      <label className="zc-field">
        Short synopsis
        <textarea
          name="synopsis"
          required
          maxLength={5000}
          rows={5}
          placeholder="What is your film about, and why does it matter?"
          aria-invalid={!!fieldErrors.synopsis}
        />
        {fieldErrors.synopsis && <small>{String(fieldErrors.synopsis)}</small>}
      </label>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="zc-check">
        <input type="checkbox" name="rights_confirmed" required />
        <span>
          I own or am authorised to represent the distribution rights to this
          film.
        </span>
      </label>
      <label className="zc-check">
        <input type="checkbox" name="consent" required />
        <span>
          I agree that Zuimi may store and review this application and contact
          me about it. I understand referral sources may be recorded as
          described below.
        </span>
      </label>
      {error && (
        <p role="alert" className="zc-error">
          {error}
        </p>
      )}
      <button disabled={busy} className="zc-cta zc-submit">
        {busy ? "Submitting your application…" : "Send my creator application"}
        <ArrowUpRight size={17} />
      </button>
      <p className="zc-small">
        Your contact and project details are visible to authorised Zuimi admins
        for review and follow-up. Referral links use first-party cookies and a
        30-day attribution window. We store campaign source, referral host and
        an anonymous visit identifier to measure creator outreach.
      </p>
    </form>
  );
}

function Field({
  name,
  title,
  type = "text",
  required = true,
  max = 160,
  placeholder = "",
  fieldErrors = {},
}: {
  name: string;
  title: string;
  type?: string;
  required?: boolean;
  max?: number;
  placeholder?: string;
  fieldErrors?: Record<string, string[]>;
}) {
  return (
    <label className="zc-field">
      {title}
      {!required && <span> Optional</span>}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={max}
        placeholder={placeholder}
        aria-invalid={!!fieldErrors[name]}
        aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
      />
      {fieldErrors[name] && (
        <small id={`${name}-error`}>{String(fieldErrors[name])}</small>
      )}
    </label>
  );
}
