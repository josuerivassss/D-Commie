import { NavLink } from "react-router-dom";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import { useTranslation } from "../context/LocaleContext";

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
        {t("sidebar.general")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/welcome`} onClick={guardedClick}>
        {t("sidebar.welcome")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/leave`} onClick={guardedClick}>
        {t("sidebar.leave")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/starboard`} onClick={guardedClick}>
        {t("sidebar.starboard")}
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/embeds`} onClick={guardedClick}>
        {t("sidebar.embeds")}
      </NavLink>
      <NavLink className="nav-item switch-server" to="/dash" onClick={guardedClick}>
        {t("sidebar.switchServer")}
      </NavLink>
    </aside>
  );
}