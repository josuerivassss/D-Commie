import Header from "../components/Header";
import { botInviteUrl, SUPPORT_SERVER_URL } from "../config";

export default function Landing() {
  return (
    <>
      <Header user={null} />
      <div className="landing-hero">
        <img className="logo" src="/logo.svg" alt="B-Commie logo" />
        <h1>B-Commie</h1>
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
    </>
  );
}
