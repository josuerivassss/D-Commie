import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTexture from "../components/PageTexture";
import { SUPPORT_SERVER_URL } from "../config";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <PageTexture />
      <Header user={null} />
      <div className="notfound-hero">
        <div className="notfound-glitch" data-text="404">404</div>
        <img className="notfound-mascot" src="/logo-mascot.png" alt="" />
        <h1>Signal lost.</h1>
        <p className="notfound-sub">
          Commie went looking for this page and came back with nothing but static.
          Either it moved, got deleted, or never existed in the first place.
        </p>
        <div className="notfound-actions">
          <Link className="btn btn-primary" to="/">Take me home</Link>
          <a className="btn btn-outline" href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer">
            Report a broken link
          </a>
        </div>
        <code className="notfound-status">ERROR 404 · CHANNEL_NOT_FOUND</code>
      </div>
      <Footer />
    </div>
  );
}