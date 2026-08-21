import Link from "next/link";
import { LogoBadge } from "@/components/logo";

export default function SecretSourceNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <LogoBadge className="mx-auto size-20" size={160} />
      <h1 className="ss-display ss-display-shadow mt-8 text-[clamp(2.5rem,8vw,4.5rem)]">
        Gone off the shelf
      </h1>
      <p className="mt-4 text-[var(--ss-smoke)]">
        That page — or that piece — isn't here any more. The rest of the stock
        is one tap away.
      </p>
      <Link
        className="ss-stencil mt-8 inline-block bg-[var(--ss-orange)] px-7 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
        href="/collections/all"
      >
        Shop the shelf
      </Link>
    </div>
  );
}
