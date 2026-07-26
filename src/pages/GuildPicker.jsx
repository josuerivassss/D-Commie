import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import GuildCard from "../components/GuildCard";
import AccessDenied from "../components/AccessDenied";
import { api, ApiError } from "../api";
import { discordLoginUrl } from "../config";
import { isLoggedIn } from "../auth";
import Footer from "../components/Footer";

const LOGIN_ERROR_MESSAGES = {
  network: "No se pudo completar el inicio de sesión por un problema de conexión. Si usas Brave, prueba desactivar Shields para este sitio (icono del león en la barra de direcciones) e inténtalo de nuevo.",
  exchange: "El código de inicio de sesión expiró o no es válido. Intenta iniciar sesión de nuevo.",
  missing_code: "No se recibió un código de inicio de sesión válido de Discord.",
  1: "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
};

export default function GuildPicker() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: null, accessDenied: false, user: null, guilds: [] });
  const loginFailed = searchParams.get("login_failed");

  useEffect(() => {
    if (!isLoggedIn()) {
      setState({ loading: false, error: null, accessDenied: false, user: null, guilds: [] });
      return;
    }
    api
      .me()
      .then(({ user, guilds }) => {
        const sorted = [...guilds].sort((a, b) => {
          if (a.has_bot !== b.has_bot) return a.has_bot ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setState({ loading: false, error: null, accessDenied: false, user, guilds: sorted });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return;
        const accessDenied = err instanceof ApiError && err.message === "dashboard_access_denied";
        setState({ loading: false, error: accessDenied ? null : err.message, accessDenied, user: null, guilds: [] });
      });
  }, []);

  if (state.accessDenied) {
    return (
      <>
        <Header user={null} />
        <AccessDenied />
        <Footer />
      </>
    );
  }

  if (!isLoggedIn()) {
    return (
      <>
        <Header user={null} />
        <div className="picker-wrap">
          <h1>Select a server</h1>
          <p className="sub">Log in with Discord to see and configure the servers you manage.</p>
          {loginFailed && <div className="flash error">{LOGIN_ERROR_MESSAGES[loginFailed] || LOGIN_ERROR_MESSAGES[1]}</div>}
          <a className="btn btn-primary" href={discordLoginUrl()}>
            Log in with Discord
          </a>
        </div>
      <Footer />
      </>
    );
  }

  if (state.loading) {
    return <div className="center-loading">Loading your servers&hellip;</div>;
  }

  return (
    <>
      <Header user={state.user} />
      <div className="picker-wrap">
        <h1>Select a server</h1>
        <p className="sub">
          Servers in color already have Commie &mdash; click one to configure it. Greyed-out servers
          don&rsquo;t have the bot yet &mdash; click one to invite it there.
        </p>
        {state.error && <div className="flash error">{state.error}</div>}
        <div className="guild-grid">
          {state.guilds.length === 0 && !state.error && (
            <p className="sub">
              You don&rsquo;t manage any servers. You need the &ldquo;Manage Server&rdquo; permission to
              configure Commie somewhere.
            </p>
          )}
          {state.guilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}