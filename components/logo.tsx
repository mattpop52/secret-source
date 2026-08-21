import Image from "next/image";
import { SHOP_NAME } from "@/lib/constants";

/** The circular badge, exactly as supplied. */
export function LogoBadge({
  size = 56,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt={SHOP_NAME}
      className={`shrink-0 ${className}`}
      height={size}
      priority={priority}
      src="/brand/logo-badge.png"
      width={size}
    />
  );
}

/** The lettering on its own, for places the ring would crowd. */
export function LogoWordmark({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt={SHOP_NAME}
      className={className}
      height={1044}
      priority={priority}
      src="/brand/wordmark.png"
      width={1600}
    />
  );
}

/** The plug from the logo's crown, reused as the shop's bullet and marker. */
export function PlugMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M9.4 6.6v3.2M14.6 6.6v3.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M7.8 10.2h8.4v2.1a4.2 4.2 0 0 1-4.2 4.2 4.2 4.2 0 0 1-4.2-4.2Z"
        fill="currentColor"
      />
      <path
        d="M12 16.5v2.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}
