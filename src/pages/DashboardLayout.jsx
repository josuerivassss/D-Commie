import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AccessDenied from "../components/AccessDenied";
import { LocaleProvider } from "../context/LocaleContext";
import { UnsavedChangesProvider } from "../context/UnsavedChangesContext";
import { api, ApiError } from "../api";
import { isLoggedIn } from "../auth";

export default function DashboardLayout() {
  const { guildId } = useParams();
  const [state, setState] = useState({ loading: true, user: null, guild: null, language: "en", denied: false, accessDenied: false });

  useEffect(() => {
    if (!isLoggedIn()) return;
    let cancelled = false;
    api
      .me()
      .then(async ({ user, guilds }) => {
        const guild = guilds.find((g) => g.id === guildId && g.has_bot);
        if (!guild) {
          if (!cancelled) setState({ loading: false, user, guild: null, language: "en", denied: true, accessDenied: false });
          return;
        }
        const config = await api.getGuildConfig(guildId).catch(() => null);
        if (cancelled) return;
        setState({ loading: false, user, guild, language: config?.language || "en", denied: false, accessDenied: false });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) return;
        const accessDenied = err instanceof ApiError && err.message === "dashboard_access_denied";
        setState({ loading: false, user: null, guild: null, language: "en", denied: true, accessDenied });
      });
    return () => { cancelled = true; };
  }, [guildId]);

  if (!isLoggedIn()) return <Navigate to="/dash" replace />;
  if (state.loading) return <div className="center-loading">Loading&hellip;</div>;
  if (state.accessDenied) return <AccessDenied />;
  if (state.denied || !state.guild) return <Navigate to="/dash" replace />;

  return (
    <LocaleProvider language={state.language}>
      <UnsavedChangesProvider>
      <Header user={state.user} />
      <div className="dash-shell">
        <Sidebar guild={state.guild} />
        <div className="dash-content">
          <Outlet context={{ guild: state.guild }} />
        </div>
      </div>
      </UnsavedChangesProvider>
    </LocaleProvider>
  );
}