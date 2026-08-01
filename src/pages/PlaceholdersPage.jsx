import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LocaleProvider, useTranslation } from "../context/LocaleContext";
import { LOCALE_CODES } from "../locales";
import { PLACEHOLDER_CATEGORIES, PLACEHOLDERS } from "../placeholders/data";
import CodeBlock from "../components/placeholders/CodeBlock";
import PlaceholderCard from "../components/placeholders/PlaceholderCard";

const STORAGE_KEY = "commie:placeholders-language";
const APPLICATION_KEYS = ["welcome", "leave", "tags", "tickets"];

const APPLICATION_EXAMPLES = {
  welcome: {
    command: "/welcome message",
    template: "{embed.title:Welcome to {guild.name}!}{embed.description:Glad to have you here, {user.mention}. You're member #{guild.members}!}{embed.thumbnail:{user.avatar}}{embed.color:23a55a}",
  },
  leave: {
    command: "/leave message",
    template: "{user.tag} just left {guild.name}. We're down to {guild.members} members.",
  },
  tags: {
    command: "/tag create rules Follow the rules",
    template: "{embed.title:Server Rules}{embed.description:Hey {user.mention}, please read the pinned post before posting.}{embed.color:5865f2}",
  },
  tickets: {
    command: "/ticket message",
    template: "Welcome {user.mention}! A member of staff will be with you shortly. This ticket was opened in {guild.name}.",
  },
};

function detectDefaultLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALE_CODES.includes(stored)) return stored;
  } catch {
    // localStorage unavailable -- fall through
  }
  const browserLang = (navigator.language || "en").slice(0, 2);
  return LOCALE_CODES.includes(browserLang) ? browserLang : "en";
}

function PlaceholdersSidebar({ active, onSelect }) {
  const { t } = useTranslation();
  const activeCategory = active.startsWith("ref-") ? active.slice(4) : null;

  return (
    <aside className="ph-sidebar">
      <button
        type="button"
        className={`ph-nav-highlight ${active === "intro" ? "active" : ""}`}
        style={{ "--nav-color": "#378ADD" }}
        onClick={() => onSelect("intro")}
      >
        {t("placeholders.nav.gettingStarted")}
      </button>

      <button
        type="button"
        className={`ph-sidebar-item ${active === "syntax" ? "active" : ""}`}
        style={{ "--nav-color": "#23a55a" }}
        onClick={() => onSelect("syntax")}
      >
        {t("placeholders.nav.syntax")}
      </button>

      <div className="ph-sidebar-folder">
        <div className="ph-sidebar-folder-title">{t("placeholders.nav.reference")}</div>
        <div className="ph-sidebar-folder-children">
          {PLACEHOLDER_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              className={`ph-sidebar-child ${activeCategory === category ? "active" : ""}`}
              onClick={() => onSelect(`ref-${category}`)}
            >
              {t(`placeholders.reference.categories.${category}`)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`ph-sidebar-item ${active === "applications" ? "active" : ""}`}
        style={{ "--nav-color": "#d4537e" }}
        onClick={() => onSelect("applications")}
      >
        {t("placeholders.nav.applications")}
      </button>

      <button
        type="button"
        className={`ph-sidebar-item ${active === "limits" ? "active" : ""}`}
        style={{ "--nav-color": "#7f77dd" }}
        onClick={() => onSelect("limits")}
      >
        {t("placeholders.nav.limits")}
      </button>
    </aside>
  );
}

function IntroSection() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("placeholders.hero.title")}</h1>
      <p className="section-sub">{t("placeholders.hero.subtitle")}</p>
      <h3>{t("placeholders.nav.gettingStarted")}</h3>
      <p>{t("placeholders.gettingStarted.p1")}</p>
      <p>{t("placeholders.gettingStarted.p2")}</p>
      <p>{t("placeholders.gettingStarted.p3")}</p>
    </>
  );
}

function SyntaxSection() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("placeholders.syntax.title")}</h1>

      <h3>{t("placeholders.syntax.basicTitle")}</h3>
      <p>{t("placeholders.syntax.basicBody")}</p>
      <CodeBlock output="Ada">{"{user.name}"}</CodeBlock>

      <h3>{t("placeholders.syntax.argsTitle")}</h3>
      <p>{t("placeholders.syntax.argsBody")}</p>
      <CodeBlock output="HELLO">{"{upper:hello}"}</CodeBlock>

      <h3>{t("placeholders.syntax.nestedTitle")}</h3>
      <p>{t("placeholders.syntax.nestedBody")}</p>
      <CodeBlock output="ADA">{"{upper:{user.name}}"}</CodeBlock>

      <h3>{t("placeholders.syntax.escapeTitle")}</h3>
      <p>{t("placeholders.syntax.escapeBody")}</p>
      <CodeBlock output="{user.name}">{"\\{user.name\\}"}</CodeBlock>

      <h3>{t("placeholders.syntax.fallbackTitle")}</h3>
      <p>{t("placeholders.syntax.fallbackBody")}</p>
      <CodeBlock output="{usr.name}">{"{usr.name}"}</CodeBlock>
    </>
  );
}

function ReferenceCategorySection({ category }) {
  const { t } = useTranslation();
  const items = PLACEHOLDERS.filter((p) => p.category === category);
  return (
    <>
      <h1>{t(`placeholders.reference.categories.${category}`)}</h1>
      <p className="section-sub">{t("placeholders.reference.subtitle")}</p>
      <div className="ph-card-grid">
        {items.map((placeholder) => (
          <PlaceholderCard key={placeholder.key} placeholder={placeholder} />
        ))}
      </div>
    </>
  );
}

function ApplicationsSection() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("placeholders.applications.title")}</h1>
      <p className="section-sub">{t("placeholders.applications.subtitle")}</p>
      {APPLICATION_KEYS.map((key) => (
        <div key={key} className="ph-application">
          <h3>{t(`placeholders.applications.${key}.title`)}</h3>
          <p>{t(`placeholders.applications.${key}.description`)}</p>
          <CodeBlock label={APPLICATION_EXAMPLES[key].command}>{APPLICATION_EXAMPLES[key].template}</CodeBlock>
          <p className="ph-application-note">{t(`placeholders.applications.${key}.note`)}</p>
        </div>
      ))}
    </>
  );
}

function LimitsSection() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("placeholders.limits.title")}</h1>
      <ul>
        <li>{t("placeholders.limits.item1")}</li>
        <li>{t("placeholders.limits.item2")}</li>
        <li>{t("placeholders.limits.item3")}</li>
        <li>{t("placeholders.limits.item4")}</li>
        <li>{t("placeholders.limits.item5")}</li>
      </ul>
    </>
  );
}

function PlaceholdersContent({ language, onLanguageChange }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("section") || "intro";

  function selectSection(id) {
    setSearchParams({ section: id }, { replace: true });
    window.scrollTo({ top: 0 });
  }

  let body;
  if (active.startsWith("ref-") && PLACEHOLDER_CATEGORIES.includes(active.slice(4))) {
    body = <ReferenceCategorySection category={active.slice(4)} />;
  } else if (active === "syntax") {
    body = <SyntaxSection />;
  } else if (active === "applications") {
    body = <ApplicationsSection />;
  } else if (active === "limits") {
    body = <LimitsSection />;
  } else {
    body = <IntroSection />;
  }

  return (
    <div className="ph-page-wrap">
      <PlaceholdersSidebar active={active} onSelect={selectSection} />
      <div className="ph-content">
        <div className="ph-content-toolbar">
          <select
            className="legal-language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label={t("placeholders.languageLabel")}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        {body}
        <Link className="legal-back-link" to="/commands">&larr; {t("placeholders.nav.reference")}</Link>
      </div>
    </div>
  );
}

export default function PlaceholdersPage() {
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
        <PlaceholdersContent language={language} onLanguageChange={setLanguage} />
      </LocaleProvider>
      <Footer />
    </>
  );
}