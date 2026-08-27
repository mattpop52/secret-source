"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SEEN_KEY = "ss-splash-v1";

/** Long enough for the flood to fill and the curtain to fall clear. */
const EXIT_MS = 1150;

/**
 * The landing card: tiled monogram ground and the wordmark. Shown once per
 * session, then the screen floods and falls away to reveal the shop already
 * sitting underneath it.
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

      {/* The whole card is the door — a real button, so it is reachable by
          keyboard and announced, rather than a div with a click handler. */}
      <button
        aria-label="Enter the shop"
        className="ss-splash-backdrop"
        onClick={enter}
        tabIndex={-1}
        type="button"
      />

      <div className="ss-splash-centre">
        <Image
          alt="Secret Source — your plug for all drip necessities"
          className="ss-splash-wordmark"
          height={732}
          priority
          src="/brand/splash-wordmark.png"
          width={1148}
        />

        <button
          className="ss-splash-enter ss-stencil"
          onClick={enter}
          type="button"
        >
          Enter the shop
        </button>
      </div>

      {/* The flood: hidden until the exit, then it swallows the card and drops away. */}
      <div className="ss-splash-flood" />
    </div>
  );
}
