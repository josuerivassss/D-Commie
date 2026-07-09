import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { api, ApiError } from "../api";
import { isLoggedIn } from "../auth";

export default function DashboardLayout() {
  const { guildId } = useParams();
  const [state, setState] = useState({ loading: true, user: null, guild: null, denied: false });

  useEffect(() => {
    if (!isLoggedIn()) return;
    api
      .me()
      .then(({ user, guilds }) => {
        const guild = guilds.find((g) => String(g.id) === String(guildId) && g.has_bot);
        setState({ loading: false, user, guild: guild || null, denied: !guild });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return;
        setState({ loading: false, user: null, guild: null, denied: true });
      });
  }, [guildId]);

  if (!isLoggedIn()) return <Navigate to="/dash" replace />;
  if (state.loading) return <div className="center-loading">Loading&hellip;</div>;
  if (state.denied || !state.guild) return <Navigate to="/dash" replace />;

  return (
    <>
      <Header user={state.user} />
      <div className="dash-shell">
        <Sidebar guild={state.guild} />
        <div className="dash-content">
          <Outlet context={{ guild: state.guild }} />
        </div>
      </div>
    </>
  );
}
