import Link from "next/link";

const LINKS = [
  { href: "/admin/stock", label: "Stock & prices" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav({ active }: { active: "stock" | "analytics" }) {
  return (
    <nav className="mb-8 flex gap-2 border-[var(--ss-hairline)] border-b pb-4">
      {LINKS.map((link) => {
        const isActive = link.href === `/admin/${active}`;
        return (
          <Link
            className={`ss-stencil border px-4 py-2.5 text-[0.62rem] transition-colors ${
              isActive
                ? "border-[var(--ss-orange)] text-[var(--ss-orange)]"
                : "border-[var(--ss-hairline)] text-[var(--ss-bone)]/75 hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
            }`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
