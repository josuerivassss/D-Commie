import { Link } from "react-router-dom";
import { botInviteUrlForGuild } from "../config";

export default function GuildCard({ guild }) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : "/logo.svg";

  const content = (
    <>
      <img className="icon" src={iconUrl} alt="" />
      <div>
        <div className="name">{guild.name}</div>
        <div className="status">{guild.has_bot ? "Configure" : "Add bot"}</div>
      </div>
    </>
  );

  if (guild.has_bot) {
    return (
      <Link className="guild-card active" to={`/dash/${guild.id}/general`}>
        {content}
      </Link>
    );
  }

  return (
    <a className="guild-card inactive" href={botInviteUrlForGuild(guild.id)}>
      {content}
    </a>
  );
}
