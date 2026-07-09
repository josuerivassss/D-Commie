import { NavLink } from "react-router-dom";

export default function Sidebar({ guild }) {
  const base = `/dash/${guild.id}`;

  return (
    <aside className="sidebar">
      <div className="guild-name">{guild.name}</div>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/general`}>
        General
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/welcome`}>
        Welcome
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/leave`}>
        Leave
      </NavLink>
      <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={`${base}/starboard`}>
        Starboard
      </NavLink>
      <NavLink className="nav-item switch-server" to="/dash">
        &larr; Switch server
      </NavLink>
    </aside>
  );
}
