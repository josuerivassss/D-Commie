import { useEffect, useState } from "react";
import Header from "../components/Header";
import GuildCard from "../components/GuildCard";
import { api, ApiError } from "../api";
import { discordLoginUrl } from "../config";
import { isLoggedIn } from "../auth";

export default function GuildPicker() {
  const [state, setState] = useState({ loading: true, error: null, user: null, guilds: [] });

  useEffect(() => {
    if (!isLoggedIn()) {
      setState({ loading: false, error: null, user: null, guilds: [] });
      return;
    }
    api
      .me()
      .then(({ user, guilds }) => {
        const sorted = [...guilds].sort((a, b) => {
          if (a.has_bot !== b.has_bot) return a.has_bot ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setState({ loading: false, error: null, user, guilds: sorted });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return; // api.js already redirects
        setState({ loading: false, error: err.message, user: null, guilds: [] });
      });
  }, []);

  if (!isLoggedIn()) {
    return (
      <>
        <Header user={null} />
        <div className="picker-wrap">
          <h1>Select a server</h1>
          <p className="sub">Log in with Discord to see and configure the servers you manage.</p>
          <a className="btn btn-primary" href={discordLoginUrl()}>
            Log in with Discord
          </a>
        </div>
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
          Servers in color already have B-Commie &mdash; click one to configure it. Greyed-out servers
          don&rsquo;t have the bot yet &mdash; click one to invite it there.
        </p>
        {state.error && <div className="flash error">{state.error}</div>}
        <div className="guild-grid">
          {state.guilds.length === 0 && !state.error && (
            <p className="sub">
              You don&rsquo;t manage any servers. You need the &ldquo;Manage Server&rdquo; permission to
              configure B-Commie somewhere.
            </p>
          )}
          {state.guilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} />
          ))}
        </div>
      </div>
    </>
  );
}
