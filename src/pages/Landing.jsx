import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import HeroPattern from "../components/HeroPattern";
import PageTexture from "../components/PageTexture";
import { botInviteUrl, SUPPORT_SERVER_URL } from "../config";
import Footer from "../components/Footer";

const AUTO_ADVANCE_MS = 5000;

const BOTS = [
  { key: "commie", label: "Commie" },
  { key: "mee6", label: "MEE6" },
  { key: "dyno", label: "Dyno" },
  { key: "carlbot", label: "Carl-bot" },
  { key: "probot", label: "Probot" },
];

const FEATURES = [
  { name: "Moderación", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Custom commands", commie: "note:Tags", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "note:Limited" },
  { name: "Starboard", commie: "yes", mee6: "no", dyno: "yes", carlbot: "yes", probot: "no" },
  { name: "Welcome & Leave", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Autoroles", commie: "yes", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Multi-idioma", commie: "yes", mee6: "note:Limited", dyno: "no", carlbot: "no", probot: "no" },
  { name: "Dashboard", commie: "note:Authorization", mee6: "yes", dyno: "yes", carlbot: "yes", probot: "yes" },
  { name: "Tickets", commie: "yes", mee6: "no", dyno: "yes", carlbot: "no", probot: "no" },
];

const SCREENSHOTS = [
  { seed: "commie-moderation", title: "Moderation" },
  { seed: "commie-welcome", title: "Welcome & Autoroles" },
  { seed: "commie-starboard", title: "Starboard" },
  { seed: "commie-dashboard", title: "Dashboard" },
];

function FeatureBadge({ value }) {
  if (value === "yes") return <span className="feature-badge yes">Yes</span>;
  if (value === "no") return <span className="feature-badge no">No</span>;
  return <span className="feature-badge note">{value.slice(5)}</span>;
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const total = SCREENSHOTS.length;
  const timerRef = useRef(null);

  function resetTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_ADVANCE_MS);
  }

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  function goTo(nextIndex) {
    setIndex(nextIndex);
    resetTimer();
  }

  function goPrev() {
    goTo((index - 1 + total) % total);
  }

  function goNext() {
    goTo((index + 1) % total);
  }

  return (
    <section className="carousel-section">
      <h2>Features</h2>
      <div className="carousel" onMouseEnter={() => clearInterval(timerRef.current)} onMouseLeave={resetTimer}>
        <button className="carousel-nav" onClick={goPrev} aria-label="Previous">
          &larr;
        </button>
        <div className="carousel-viewport">
          <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {SCREENSHOTS.map((s) => (
              <div className="carousel-slide" key={s.seed}>
                <img src={`https://picsum.photos/seed/${s.seed}/1400/600`} alt={s.title} />
                <div className="carousel-caption">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="carousel-nav" onClick={goNext} aria-label="Next">
          &rarr;
        </button>
      </div>
      <div className="carousel-dots">
        {SCREENSHOTS.map((s, i) => (
          <button
            key={s.seed}
            className={`carousel-dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
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
          Commie is an aio (all-in-one) bot for Discord: moderation, tags, starboard, welcome and goodbye messages, autoroles, and a web dashboard, all in one bot. Built to be powerful and scalable, it works just as well on a small server as on one with thousands of members.
        </p>
      </section>

      <section className="feature-table-wrap">
        <h2>Comparison with other bots</h2>
        <p className="feature-table-note">Approximate comparison, subject to change according to each bot's updates.</p>
        <table className="feature-table">
          <thead>
            <tr>
              <th>Features</th>
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
      <Footer />
    </div>
  );
}