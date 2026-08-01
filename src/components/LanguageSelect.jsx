import { useEffect, useRef, useState } from "react";
import { twemojiUrl } from "../utils/twemoji";
import { LANGUAGES } from "../validation";

export default function LanguageSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const current = LANGUAGES.find((lang) => lang.code === value) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function select(code) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div className="lang-select" ref={containerRef}>
      <button type="button" className="lang-select-trigger" onClick={() => setOpen((prev) => !prev)}>
        <img className="lang-select-flag" src={twemojiUrl(current.flag)} alt="" />
        <span>{current.label}</span>
        <svg className="lang-select-chevron" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="lang-select-menu" role="listbox">
          {LANGUAGES.map((lang) => (
            <button
              type="button"
              key={lang.code}
              role="option"
              aria-selected={lang.code === value}
              className={`lang-select-option ${lang.code === value ? "active" : ""}`}
              onClick={() => select(lang.code)}
            >
              <img className="lang-select-flag" src={twemojiUrl(lang.flag)} alt="" />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}