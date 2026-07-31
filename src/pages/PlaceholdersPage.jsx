import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function PlaceholdersContent({ language, onLanguageChange }) {
  const { t } = useTranslation();

  return (
    <div className="legal-page ph-page">
      <div className="legal-header-row">
        <h1 className="ph-hero-title">{t("placeholders.hero.title")}</h1>
        <select className="legal-language-select" value={language} onChange={(e) => onLanguageChange(e.target.value)} aria-label={t("placeholders.languageLabel")}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
      <p className="ph-hero-subtitle">{t("placeholders.hero.subtitle")}</p>

      <div className="legal-layout">
        <nav className="legal-toc">
          <div className="legal-toc-title">{t("placeholders.reference.title")}</div>
          <a href="#getting-started" className="legal-toc-link">{t("placeholders.nav.gettingStarted")}</a>
          <a href="#syntax" className="legal-toc-link">{t("placeholders.nav.syntax")}</a>
          <a href="#placeholders" className="legal-toc-link">{t("placeholders.nav.reference")}</a>
          <a href="#applications" className="legal-toc-link">{t("placeholders.nav.applications")}</a>
          <a href="#limits" className="legal-toc-link">{t("placeholders.nav.limits")}</a>
        </nav>

        <article className="legal-body ph-body">
          <section id="getting-started">
            <h2>{t("placeholders.gettingStarted.title")}</h2>
            <p>{t("placeholders.gettingStarted.p1")}</p>
            <p>{t("placeholders.gettingStarted.p2")}</p>
            <p>{t("placeholders.gettingStarted.p3")}</p>
          </section>

          <section id="syntax">
            <h2>{t("placeholders.syntax.title")}</h2>

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
          </section>

          <section id="placeholders">
            <h2>{t("placeholders.reference.title")}</h2>
            <p>{t("placeholders.reference.subtitle")}</p>
            {PLACEHOLDER_CATEGORIES.map((category) => {
              const items = PLACEHOLDERS.filter((p) => p.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category} className="ph-category">
                  <h3>{t(`placeholders.reference.categories.${category}`)}</h3>
                  <div className="ph-card-grid">
                    {items.map((placeholder) => <PlaceholderCard key={placeholder.key} placeholder={placeholder} />)}
                  </div>
                </div>
              );
            })}
          </section>

          <section id="applications">
            <h2>{t("placeholders.applications.title")}</h2>
            <p>{t("placeholders.applications.subtitle")}</p>
            {APPLICATION_KEYS.map((key) => (
              <div key={key} className="ph-application">
                <h3>{t(`placeholders.applications.${key}.title`)}</h3>
                <p>{t(`placeholders.applications.${key}.description`)}</p>
                <CodeBlock label={APPLICATION_EXAMPLES[key].command}>{APPLICATION_EXAMPLES[key].template}</CodeBlock>
                <p className="ph-application-note">{t(`placeholders.applications.${key}.note`)}</p>
              </div>
            ))}
          </section>

          <section id="limits">
            <h2>{t("placeholders.limits.title")}</h2>
            <ul>
              <li>{t("placeholders.limits.item1")}</li>
              <li>{t("placeholders.limits.item2")}</li>
              <li>{t("placeholders.limits.item3")}</li>
              <li>{t("placeholders.limits.item4")}</li>
              <li>{t("placeholders.limits.item5")}</li>
            </ul>
          </section>
        </article>
      </div>

      <Link className="legal-back-link" to="/commands">&larr; {t("placeholders.nav.reference")}</Link>
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