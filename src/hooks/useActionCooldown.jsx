import { useEffect, useRef, useState } from "react";

const DEFAULT_COOLDOWN_SECONDS = 20;

/** Client-side spam guard for action buttons (save/update/publish): starts
 * counting down the moment the action is triggered, regardless of whether
 * it later succeeds or fails, so a rapid double-click can never fire two
 * requests. Independent per hook instance -- use one call per button. */
export function useActionCooldown(seconds = DEFAULT_COOLDOWN_SECONDS) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function startCooldown() {
    clearInterval(intervalRef.current);
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return { remaining, startCooldown };
}