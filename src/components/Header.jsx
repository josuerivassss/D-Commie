import { Link, NavLink } from "react-router-dom";
import { botInviteUrl, SUPPORT_SERVER_URL } from "../config";
import { logout as logoutRequest } from "../auth";

export default function Header({ user }) {
  async function logout() {
    await logoutRequest();
    window.location.href = "/";
  }

  return (
    <header className="header">
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