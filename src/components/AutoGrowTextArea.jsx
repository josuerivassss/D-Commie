import { useLayoutEffect, useRef } from "react";

/** A <textarea> that grows in height to fit its content instead of staying
 * a fixed size, up to a sane max-height (past that it scrolls normally
 * instead of growing forever). All other props (maxLength, placeholder,
 * onChange, className, ...) are forwarded straight to the underlying
 * textarea, so it's a drop-in replacement for a plain <textarea>. */
export default function AutoGrowTextarea({ value, className = "", ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      className={`autogrow-textarea ${className}`.trim()}
      {...props}
    />
  );
}