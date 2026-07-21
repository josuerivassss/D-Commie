import { NavLink } from "react-router-dom";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";

export default function Sidebar({ guild }) {
  const base = `/dash/${guild.id}`;
  const { confirmNavigation } = useUnsavedChangesGuard();

  function guardedClick(e) {
    if (!confirmNavigation()) e.preventDefault();
  }

  return (
    <aside className="sidebar">
      <div className="guild-name">{guild.name}</div>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/general`} onClick={guardedClick}>
        General
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/welcome`} onClick={guardedClick}>
        Welcome & Autoroles
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/leave`} onClick={guardedClick}>
        Leave
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/starboard`} onClick={guardedClick}>
        Starboard
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/embeds`} onClick={guardedClick}>
        Embeds
      </NavLink>
      <NavLink className="nav-item switch-server" to="/dash" onClick={guardedClick}>
        &larr; Switch server
      </NavLink>
    </aside>
  );
}