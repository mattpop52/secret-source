"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SEEN_KEY = "ss-splash-v1";

/** Long enough for the flood to fill and the curtain to fall clear. */
const EXIT_MS = 1150;

/**
 * The landing card: tiled monogram ground behind the rendered pour, with the
 * real wordmark laid over it. The picture came back with the lettering garbled
 * into it, so that band is shaded out in the JPEG and the logo is drawn back on
 * as its own layer, off the original artwork — which also keeps it sharp on a
 * high-density screen instead of sharing the photograph's resolution. On a
 * phone-shaped viewport the pair fills the screen edge to edge (the picture's
 * aspect ratio is close enough to a phone's that the crop is unnoticeable); on
 * anything wider they sit centred at their own aspect ratio, so the tiled
 * ground shows through at the sides. Shown once per session, then the screen
 * floods and falls away to reveal the shop already sitting under it.
 */
export function Splash() {
  const [phase, setPhase] = useState<"in" | "leaving" | "gone">("in");

  const enter = useCallback(() => {
    setPhase((current) => {
      if (current !== "in") {
        return current;
      }

      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Private mode or blocked storage — the splash simply shows again.
      }

      return "leaving";
    });
  }, []);

  // Anyone arriving with the flag already set never sees this mount: the
  // inline script in the layout hides it before first paint. This is the
  // client-side half of the same decision, for a soft navigation home.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen) {
      setPhase("gone");
      return;
    }

    document.documentElement.dataset.splash = "showing";
  }, []);

  useEffect(() => {
    if (phase !== "leaving") {
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase("gone");
      document.documentElement.dataset.splash = "skip";
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "gone") {
      document.documentElement.dataset.splash = "skip";
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        enter();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", enter, { passive: true, once: true });
    window.addEventListener("touchmove", enter, { passive: true, once: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", enter);
      window.removeEventListener("touchmove", enter);
    };
  }, [phase, enter]);

  if (phase === "gone") {
    return null;
  }

  return (
    <div className="ss-splash" data-state={phase}>
      <div className="ss-splash-ground" />
      <div className="ss-splash-vignette" />

      <div className="ss-splash-centre">
        <div className="ss-splash-plate">
          {/* Decorative: the pour, the tiled ground and the drawn-in button are
              scenery. Everything it says is said by the wordmark's alt text and
              the button's label below. */}
          <Image
            alt=""
            className="ss-splash-pour"
            height={1525}
            priority
            src="/brand/splash-pour.jpg"
            width={704}
          />
          {/* Light running down the caramel, clipped to it by a mask cut
              from the picture. Sits over the photograph, under the logo. */}
          <div className="ss-splash-sheen">
            <div className="ss-splash-sheen-band" />
          </div>

          {/* One connected body in two pieces from the same pixels: the
              column stretches from its anchored top, the drop rides its far
              end on the same clock, and their overlap shares the column's
              constant cross-section — so the run lengthens as one movement
              with no visible join. */}
          <div className="ss-splash-taffy">
            <Image
              alt=""
              height={152}
              src="/brand/splash-column.png"
              width={160}
            />
          </div>
          <div className="ss-splash-fall">
            <Image
              alt=""
              height={280}
              src="/brand/splash-drop.png"
              width={160}
            />
          </div>

          {/* The real logo, off the original artwork, over the shaded-out band
              where the rendered picture had it garbled. */}
          <Image
            alt="Secret Source — your plug for all drip necessities"
            className="ss-splash-mark"
            height={1017}
            priority
            src="/brand/splash-wordmark.png"
            width={1600}
          />
        </div>
      </div>

      {/* The whole card is the door — a real button, so it is reachable by
          keyboard and announced, rather than a div with a click handler. It
          sits above the picture (which is otherwise inert) so the entire
          card is clickable, not just the button drawn into the image. */}
      <button
        aria-label="Enter the shop"
        className="ss-splash-backdrop"
        onClick={enter}
        type="button"
      />

      {/* The flood: hidden until the exit, then it swallows the card and drops away. */}
      <div className="ss-splash-flood" />
    </div>
  );
}
