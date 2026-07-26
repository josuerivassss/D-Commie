import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import Header from "../components/Header";
import { LocaleProvider, useTranslation } from "../context/LocaleContext";
import { LOCALE_CODES } from "../locales";
import { LEGAL_METADATA } from "../legal/metadata";
import termsEn from "../legal/terms.en.md?raw";
import termsEs from "../legal/terms.es.md?raw";
import privacyEn from "../legal/privacy.en.md?raw";
import privacyEs from "../legal/privacy.es.md?raw";
import Footer from "../components/Footer";

const DOCS = {
  terms: { en: termsEn, es: termsEs },
  privacy: { en: privacyEn, es: privacyEs },
};
const STORAGE_KEY = "commie:legal-language";

function detectDefaultLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALE_CODES.includes(stored)) return stored;
  } catch {
    // localStorage unavailable (private browsing, etc.) -- fall through
  }
  const browserLang = (navigator.language || "en").slice(0, 2);
  return LOCALE_CODES.includes(browserLang) ? browserLang : "en";
}

// Strips common inline markdown before slugifying a heading, so the TOC's
// anchor links match exactly what rehype-slug generates for the rendered
// heading text (which never includes literal markdown syntax characters).
function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

function extractHeadings(markdown) {
  const slugger = new GithubSlugger();
  const headings = [];
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (match) {
      const text = stripInlineMarkdown(match[2]);
      headings.push({ depth: match[1].length, text, slug: slugger.slug(text) });
    }
  }
  return headings;
}

function LegalContent({ language, onLanguageChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const doc = searchParams.get("doc") === "privacy" ? "privacy" : "terms";

  function switchDoc(nextDoc) {
    setSearchParams({ doc: nextDoc });
    window.scrollTo({ top: 0 });
  }

  const markdown = DOCS[doc][language] || DOCS[doc].en;
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const lastUpdated = LEGAL_METADATA[doc].lastUpdated;

  return (
    <div className="legal-page">
      <div className="legal-header-row">
        <div className="legal-tabs">
          <button type="button" className={`legal-tab ${doc === "terms" ? "active" : ""}`} onClick={() => switchDoc("terms")}>
            {t("legal.termsTab")}
          </button>
          <button type="button" className={`legal-tab ${doc === "privacy" ? "active" : ""}`} onClick={() => switchDoc("privacy")}>
            {t("legal.privacyTab")}
          </button>
        </div>
        <select
          className="legal-language-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label={t("legal.languageLabel")}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <p className="legal-last-updated">{t("legal.lastUpdated", { date: lastUpdated })}</p>

      <div className="legal-layout">
        <nav className="legal-toc">
          <div className="legal-toc-title">{t("legal.onThisPage")}</div>
          {headings.map((h) => (
            <a key={h.slug} href={`#${h.slug}`} className={`legal-toc-link depth-${h.depth}`}>
              {h.text}
            </a>
          ))}
        </nav>
        <article className="legal-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {markdown}
          </ReactMarkdown>
        </article>
      </div>

      <Link className="legal-back-link" to="/">{t("legal.backHome")}</Link>
    </div>
  );
}

export default function LegalPage() {
  const [language, setLanguage] = useState(detectDefaultLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [language]);

  return (
    <>
    <LocaleProvider language={language}>
      <Header user={null} />
      <LegalContent language={language} onLanguageChange={setLanguage} />
    </LocaleProvider>
    <Footer />
    </>
  );
}