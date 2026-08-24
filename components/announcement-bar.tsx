"use client";

import { FREE_SHIPPING_THRESHOLD, RETURNS_WINDOW } from "@/lib/constants";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";

/**
 * The reference for this shop runs a repeating authenticity banner. Here it
 * is taped to the top of the page — two strips of hazard tape with the
 * promises running between them.
 */
export function AnnouncementBar() {
  const { format } = useCurrency();
  const { t } = useLanguage();

  const NOTICES = [
    t("noticeChecked"),
    t("noticeWorldwideDelivery"),
    t("noticeFreeDeliveryOver", { amount: format(FREE_SHIPPING_THRESHOLD) }),
    t("noticeReturns", { returns: RETURNS_WINDOW }),
  ];

  return (
    <div className="border-[var(--ss-hairline)] border-b bg-[var(--ss-pitch)]">
      <div className="ss-tape-thin h-[5px]" />
      <div className="ss-marquee overflow-hidden py-2">
        <div className="ss-marquee-track ss-marquee-track-fast">
          {[0, 1].map((copy) => (
            <ul
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center"
              key={copy}
            >
              {NOTICES.map((notice) => (
                <li
                  className="ss-stencil flex items-center gap-4 whitespace-nowrap px-5 text-[0.62rem] text-[var(--ss-bone)]/75"
                  key={notice}
                >
                  <span className="size-1 bg-[var(--ss-orange)]" />
                  {notice}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div className="ss-tape-thin h-[5px]" />
    </div>
  );
}
