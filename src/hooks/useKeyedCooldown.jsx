import { useRef, useState } from "react";

const DEFAULT_COOLDOWN_SECONDS = 10;

/** Same spam-guard pattern as useActionCooldown, but tracks an independent
 * cooldown per key (e.g. one per toggleable row) instead of a single one.
 * Ticks every second only while at least one key is on cooldown. */
export function useKeyedCooldown(seconds = DEFAULT_COOLDOWN_SECONDS) {
  const [, forceTick] = useState(0);
  const expiresAt = useRef(new Map());
  const intervalRef = useRef(null);

  function ensureTicking() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      let stillActive = false;
      for (const [key, expiry] of expiresAt.current) {
        if (expiry <= now) expiresAt.current.delete(key);
        else stillActive = true;
      }
      forceTick((n) => n + 1);
      if (!stillActive) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
  }

  function start(key) {
    expiresAt.current.set(key, Date.now() + seconds * 1000);
    ensureTicking();
    forceTick((n) => n + 1);
  }

  function remaining(key) {
    const expiry = expiresAt.current.get(key);
    if (!expiry) return 0;
    return Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
  }

  function isActive(key) {
    return remaining(key) > 0;
  }

  return { start, remaining, isActive };
}