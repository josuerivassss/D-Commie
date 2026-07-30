import { Link } from "react-router-dom";
import { SUPPORT_SERVER_URL } from "../config";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>&copy; {new Date().getFullYear()} Commie</span>
      <nav className="footer-links">
        <Link to="/commands">Commands</Link>
        <Link to="/changelog">Changelog</Link>
        <Link to="/legal?doc=terms">Terms of Service</Link>
        <Link to="/legal?doc=privacy">Privacy Policy</Link>
        <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer">Support Server</a>
      </nav>
    </footer>
  );
}