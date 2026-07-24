import { useState } from "react";
import Header from "../components/Header";
import HeroPattern from "../components/HeroPattern";
import PageTexture from "../components/PageTexture";
import { botInviteUrl, SUPPORT_SERVER_URL } from "../config";

const BOTS = [
  { key: "commie", label: "Commie" },
  { key: "mee6", label: "MEE6" },
  { key: "dyno", label: "Dyno" },
  { key: "carlbot", label: "Carl-bot" },
  { key: "probot", label: "Probot" },
];

const FEATURES = [
  { name: "Moderación", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Custom commands", commie: "note:Tags", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "note:Limitado" },
  { name: "Starboard", commie: "yes", mee6: "no", dyno: "yes", carlbot: "yes", probot: "no" },
  { name: "Welcome & Leave", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Autoroles", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Multi-idioma", commie: "yes", mee6: "note:Limitado", dyno: "no", carlbot: "no", probot: "no" },
  { name: "Dashboard", commie: "note:Authorization", mee6: "note:Premium", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Tickets", commie: "yes", mee6: "no", dyno: "yes", carlbot: "no", probot: "no" },
];

const SCREENSHOTS = [
  { seed: "commie-moderation", title: "Moderación" },
  { seed: "commie-welcome", title: "Welcome & Autoroles" },
  { seed: "commie-starboard", title: "Starboard" },
  { seed: "commie-dashboard", title: "Dashboard" },
];

function FeatureBadge({ value }) {
  if (value === "yes") return <span className="feature-badge yes">Sí</span>;
  if (value === "no") return <span className="feature-badge no">No</span>;
  return <span className="feature-badge note">{value.slice(5)}</span>;
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const total = SCREENSHOTS.length;
  const current = SCREENSHOTS[index];

  return (
    <section className="carousel-section">
      <h2>Funcionalidades</h2>
      <div className="carousel">
        <button className="carousel-nav" onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label="Previous">
          &larr;
        </button>
        <div className="carousel-slide">
          <img src={`https://picsum.photos/seed/${current.seed}/900/500`} alt={current.title} />
          <div className="carousel-caption">{current.title}</div>
        </div>
        <button className="carousel-nav" onClick={() => setIndex((i) => (i + 1) % total)} aria-label="Next">
          &rarr;
        </button>
      </div>
      <div className="carousel-dots">
        {SCREENSHOTS.map((s, i) => (
          <button
            key={s.seed}
            className={`carousel-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${s.title}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <PageTexture />
      <Header user={null} />
      <div className="landing-hero">
        <HeroPattern />
        <img className="logo" src="/logo-square.png" alt="Commie logo" />
        <h1>Commie</h1>
        <p className="tagline">
          A friendly, all-in-one Discord bot for moderation, welcomes, starboard, reminders and more.
        </p>
        <div className="landing-actions">
          <div className="row">
            <a className="btn btn-primary" href={botInviteUrl()}>
              Add to Server
            </a>
            <a className="btn btn-secondary" href="/dash">
              Dashboard
            </a>
          </div>
          <a className="btn btn-outline btn-wide" href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer">
            Support Server
          </a>
        </div>
      </div>

      <section className="about-section">
        <p>
          Commie es un bot aio (all-in-one / todo-en-uno) para Discord: moderación, tags, starboard,
          mensajes de bienvenida y despedida, autoroles y una dashboard web, todo en un mismo bot.
          Construido para ser powerful (poderoso) y escalable, funciona igual de bien en un servidor
          pequeño que en uno con miles de miembros.
        </p>
      </section>

      <section className="feature-table-wrap">
        <h2>¿Cómo se compara Commie?</h2>
        <p className="feature-table-note">Comparación aproximada, sujeta a cambios según las actualizaciones de cada bot.</p>
        <table className="feature-table">
          <thead>
            <tr>
              <th>Características</th>
              {BOTS.map((bot) => (
                <th key={bot.key}>{bot.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                {BOTS.map((bot) => (
                  <td key={bot.key}>
                    <FeatureBadge value={row[bot.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Carousel />
    </div>
  );
}