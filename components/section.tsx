import type { ReactNode } from "react";

/**
 * Every section on the shop opens the same way: a small orange index number,
 * a stencilled label, then the headline. Same stamp on every crate.
 */
export function SectionHeading({
  index,
  label,
  title,
  action,
}: {
  index: string;
  label: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <p className="ss-stencil flex items-center gap-3 text-[0.7rem] text-[var(--ss-orange)]">
          <span className="ss-num bg-[var(--ss-orange)] px-1.5 py-0.5 text-[#120c00]">
            {index}
          </span>
          {label}
        </p>
        <h2 className="ss-display ss-display-shadow mt-3 text-[clamp(2rem,5.5vw,3.75rem)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`px-4 py-16 sm:px-6 sm:py-20 ${className}`} id={id}>
      <div className="mx-auto max-w-[1240px]">{children}</div>
    </section>
  );
}
