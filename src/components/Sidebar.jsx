import { NavLink } from "react-router-dom";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import { useTranslation } from "../context/LocaleContext";

function IconGeneral() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6" strokeLinecap="round" />
    </svg>
  );
}

function IconWelcome() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M8 1.5 9 4l2.5.5-2 1.8.5 2.5L8 7.6 5.9 8.8l.5-2.5-2-1.8L6.9 4 8 1.5Z" strokeLinejoin="round" />
      <path d="M2.5 13.5c1-2 3-3 5.5-3s4.5 1 5.5 3" strokeLinecap="round" />
    </svg>
  );
}

function IconLeave() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M6.5 1.5H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 5.5 13 8l-3.5 2.5M13 8H5.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStarboard() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.4l-3.9 2.1.9-4.4-3.3-3 4.4-.5L8 1.5Z" />
    </svg>
  );
}

function IconTickets() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2 5.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 14 5.5v1a1.2 1.2 0 0 0 0 2v1a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 9.5v-1a1.2 1.2 0 0 0 0-2v-1Z" strokeLinejoin="round" />
      <path d="M6 4v8" strokeDasharray="1.6 1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconEmbeds() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6A1.5 1.5 0 0 1 12.5 11H6l-2.8 2.5V11h-.2A1.5 1.5 0 0 1 2 9.5v-6Z" strokeLinejoin="round" />
      <path d="M5 5.5h6M5 7.8h3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSwitchServer() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M4.5 4h8l-2-2M11.5 12h-8l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar({ guild }) {
  const base = `/dash/${guild.id}`;
  const { confirmNavigation } = useUnsavedChangesGuard();
  const { t } = useTranslation();

  function guardedClick(e) {
    if (!confirmNavigation()) e.preventDefault();
  }

  return (
    <aside className="sidebar">
      <div className="guild-name">{guild.name}</div>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/general`} onClick={guardedClick}>
        <IconGeneral />
        {t("sidebar.general")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/welcome`} onClick={guardedClick}>
        <IconWelcome />
        {t("sidebar.welcome")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/leave`} onClick={guardedClick}>
        <IconLeave />
        {t("sidebar.leave")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/starboard`} onClick={guardedClick}>
        <IconStarboard />
        {t("sidebar.starboard")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/tickets`} onClick={guardedClick}>
        <IconTickets />
        {t("sidebar.tickets")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/embeds`} onClick={guardedClick}>
        <IconEmbeds />
        {t("sidebar.embeds")}
      </NavLink>
      <NavLink className="nav-item switch-server" to="/dash" onClick={guardedClick}>
        <IconSwitchServer />
        {t("sidebar.switchServer")}
      </NavLink>
    </aside>
  );
}