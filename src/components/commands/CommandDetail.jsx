import { useMemo, useState } from "react";
import { categoryMeta } from "../../commands/categories";
import Badge from "./Badge";

const COPY_FEEDBACK_MS = 2000;

function findCommand(commands, name) {
  return commands.find((c) => c.name === name) || null;
}

function buildSlashPreview(command, parentName) {
  const fullName = parentName ? `${parentName} ${command.name}` : command.name;
  const args = (command.options || [])
    .map((o) => (o.required ? `${o.name}:<${o.type}>` : `[${o.name}:<${o.type}>]`))
    .join(" ");
  return `${fullName}${args ? " " + args : ""}`;
}

function CopyMentionButton({ command, parentName }) {
  const [copied, setCopied] = useState(false);
  if (!command.id_slash) return null;

  const fullName = parentName ? `${parentName} ${command.name}` : command.name;
  const mention = `</${fullName}:${command.id_slash}>`;

  function handleCopy() {
    navigator.clipboard?.writeText(mention);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  }

  return (
    <button
      type="button"
      className={`cmd-copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      disabled={copied}
      title="Copy Discord mention markup"
    >
      {copied ? "Copied" : "Copy mention"}
    </button>
  );
}

function OptionsTable({ options }) {
  if (!options || options.length === 0) return null;
  return (
    <table className="cmd-options-table">
      <thead>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Description</th></tr>
      </thead>
      <tbody>
        {options.map((option) => (
          <tr key={option.name}>
            <td><code>{option.name}</code></td>
            <td><code className="cmd-option-type">{option.type}</code></td>
            <td>{option.required ? <span className="cmd-required-yes">Required</span> : <span className="cmd-required-no">Optional</span>}</td>
            <td>{option.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CommandBody({ command, parentName }) {
  const hasRestrictions = command.permissions?.user?.length || command.permissions?.bot?.length || command.owner_only || command.guild_only || command.cooldown;

  return (
    <>
      <p className="cmd-description">{command.description || "No description provided."}</p>

      <div className="cmd-badges-row">
        {command.owner_only && <Badge tone="danger" icon="lock">Owner only</Badge>}
        {command.guild_only && <Badge tone="neutral" icon="server">Server only</Badge>}
        {command.cooldown && (
          <Badge tone="neutral" icon="clock">
            {command.cooldown.uses}x / {command.cooldown.per_seconds}s per {command.cooldown.bucket}
          </Badge>
        )}
        {command.permissions?.user?.map((perm) => <Badge key={`u-${perm}`} tone="user-perm" icon="lock">{perm}</Badge>)}
        {command.permissions?.bot?.map((perm) => <Badge key={`b-${perm}`} tone="bot-perm" icon="bot">Bot needs {perm}</Badge>)}
        {!hasRestrictions && <Badge tone="neutral">No restrictions</Badge>}
      </div>

      <div className="cmd-usage-block">
        <div className="cmd-usage-header">
          <span>Usage</span>
          <CopyMentionButton command={command} parentName={parentName} />
        </div>
        <div className="cmd-usage-line">
          <span className="cmd-usage-prompt">/</span>
          <code>{buildSlashPreview(command, parentName)}</code>
        </div>
        <div className="cmd-usage-line cmd-usage-prefix">
          <span className="cmd-usage-prompt">c!</span>
          <code>{command.usage?.prefix}</code>
        </div>
        {command.aliases?.length > 0 && (
          <div className="cmd-usage-aliases">
            Aliases: {command.aliases.map((a) => <code key={a}>{a}</code>)}
          </div>
        )}
      </div>

      <OptionsTable options={command.options} />
    </>
  );
}

function countLabel(list) {
  const subCount = list.reduce((sum, c) => sum + (c.children?.length || 0), 0);
  const commandLabel = `${list.length} command${list.length === 1 ? "" : "s"}`;
  if (subCount === 0) return commandLabel;
  return `${commandLabel}, ${subCount} subcommand${subCount === 1 ? "" : "s"}`;
}

function CommandsOverview({ commands, onSelect }) {
  const categories = useMemo(() => {
    const map = new Map();
    for (const command of commands) {
      if (!map.has(command.category)) map.set(command.category, []);
      map.get(command.category).push(command);
    }
    return Array.from(map.entries());
  }, [commands]);

  return (
    <section className="cmd-overview">
      <h1>Command reference</h1>
      <p className="cmd-overview-sub">
        Every command Commie understands, grouped by category. Search on the left, or jump straight to a category below.
      </p>
      <div className="cmd-overview-grid">
        {categories.map(([name, list]) => {
          const meta = categoryMeta(name);
          return (
            <button type="button" key={name} className="cmd-overview-card" style={{ "--card-color": meta.color }} onClick={() => onSelect(list[0].name)}>
              <span className="cmd-overview-card-name">{name}</span>
              <span className="cmd-overview-card-count">{countLabel(list)}</span>
              {meta.description && <span className="cmd-overview-card-desc">{meta.description}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function CommandDetail({ commands, activeCommand, activeChild, onSelect, onBack }) {
  const command = useMemo(() => (activeCommand ? findCommand(commands, activeCommand) : null), [commands, activeCommand]);
  const child = useMemo(() => (command && activeChild ? findCommand(command.children, activeChild) : null), [command, activeChild]);

  if (!command) return <CommandsOverview commands={commands} onSelect={onSelect} />;

  const meta = categoryMeta(command.category);
  const displayed = child || command;
  const parentName = child ? command.name : null;

  return (
    <section className="cmd-detail">
      <button type="button" className="cmd-back-btn" onClick={onBack}>&larr; All commands</button>

      <div className="cmd-detail-header">
        <span className="cmd-category-pill" style={{ "--pill-color": meta.color }}>{command.category}</span>
        <h1>{parentName && <span className="cmd-parent-name">{parentName} </span>}{displayed.name}</h1>
      </div>

      <CommandBody command={displayed} parentName={parentName} />

      {!child && command.children?.length > 0 && (
        <div className="cmd-subcommands">
          <div className="cmd-subcommands-title">Subcommands</div>
          <div className="cmd-subcommands-grid">
            {command.children.map((sub) => (
              <button type="button" key={sub.name} className="cmd-subcommand-card" onClick={() => onSelect(command.name, sub.name)}>
                <span className="cmd-subcommand-name">{sub.name}</span>
                <span className="cmd-subcommand-desc">{sub.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}