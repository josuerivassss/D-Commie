import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { botInviteUrl, SUPPORT_SERVER_URL } from "../config";
import { logout as logoutRequest } from "../auth";

// Por debajo de este scroll, el header siempre se muestra (se sentiría raro
// que se oculte apenas cargas la página). Pasado ese punto, se oculta al
// bajar y reaparece apenas subes un poco -- así no estorba mientras lees,
// pero siempre está a un pequeño scroll de distancia.
const HIDE_THRESHOLD_PX = 80;

function useScrollAwareHeader() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function handleScroll() {
      const y = window.scrollY;
      const goingDown = y > lastY.current;

      setScrolled(y > 4);
      setHidden(y > HIDE_THRESHOLD_PX && goingDown);

      lastY.current = y;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { hidden, scrolled };
}

export default function Header({ user }) {
  const { hidden, scrolled } = useScrollAwareHeader();

  async function logout() {
    await logoutRequest();
    window.location.href = "/";
  }

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""} ${hidden ? "header-hidden" : ""}`}>
      <Link className="brand" to="/">
        <img src="/logo-mascot.png" alt="Commie logo" />
        Commie
      </Link>
      <nav>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/commands">
          Commands
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/placeholders">
          Placeholders
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dash">
          Dashboard
        </NavLink>
        <a className="nav-link" href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer">
          Support Server
        </a>
        <a className="nav-cta" href={botInviteUrl()}>Add to Server</a>
        {user && (
          <span className="user-chip">
            {user.avatar && (
              <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="" />
            )}
            {user.username}
            &middot; <button onClick={logout}>Log out</button>
          </span>
        )}
      </nav>
    </header>
  );
}