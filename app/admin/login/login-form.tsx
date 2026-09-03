"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error ?? "Wrong password.");
        return;
      }

      const next = searchParams.get("next");
      router.push(next?.startsWith("/admin") ? next : "/admin/stock");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-20">
      <h1 className="ss-display text-3xl">Admin</h1>
      <p className="mt-2 text-[var(--ss-smoke)] text-sm">
        Stock control — staff only.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="ss-stencil mb-1.5 block text-[0.6rem] text-[var(--ss-smoke)]"
            htmlFor={passwordId}
          >
            Password
          </label>
          <input
            // biome-ignore lint/a11y/noAutofocus: the sole control on a dedicated login screen
            autoFocus
            className="w-full border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2.5 text-[0.85rem] text-[var(--ss-bone)] transition-colors placeholder:text-[var(--ss-smoke)] hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]"
            id={passwordId}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </div>

        <button
          className="ss-stencil w-full bg-[var(--ss-orange)] py-3.5 text-[#120c00] text-[0.75rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60"
          disabled={submitting || !password}
          type="submit"
        >
          {submitting ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
