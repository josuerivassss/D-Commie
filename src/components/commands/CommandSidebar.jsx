function CommandIcon() {
  return (
    <span className="cmd-tree-icon cmd-tree-icon-command" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#eef1f6" strokeWidth="4" strokeLinecap="round">
        <path d="M15 4L9 20" />
      </svg>
    </span>
  );
}

function SubcommandIcon() {
  return (
    <span className="cmd-tree-icon cmd-tree-icon-sub" aria-hidden="true">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#efeef7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3V13C7 15.2 8.8 17 11 17H17" />
        <path d="M13 13L17 17L13 21" />
      </svg>
    </span>
  );
}

function TreeCommand({ command, isActive, activeChild, expanded, onSelect }) {
  const hasChildren = command.children && command.children.length > 0;
  const showChildren = hasChildren && (isActive || expanded);

  return (
    <div className="cmd-tree-item">
      <button
        type="button"
        className={`cmd-tree-row ${isActive && !activeChild ? "active" : ""}`}
        onClick={() => onSelect(command.name)}
      >
        <CommandIcon />
        <span className="cmd-tree-name">{command.name}</span>
        {command.permissions?.user?.length > 0 && <span className="cmd-tree-lock" title="Requires permissions" />}
      </button>
      {showChildren && (
        <div className="cmd-tree-children">
          {command.children.map((child) => (
            <button
              type="button"
              key={child.name}
              className={`cmd-tree-row cmd-tree-row-child ${isActive && activeChild === child.name ? "active" : ""}`}
              onClick={() => onSelect(command.name, child.name)}
            >
              <SubcommandIcon />
              <span className="cmd-tree-name">{child.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewLink({ isActive, onClick }) {
  return (
    <button type="button" className={`cmd-overview-link ${isActive ? "active" : ""}`} onClick={onClick}>
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
      </svg>
      All categories
    </button>
  );
}

export default function CommandSidebar({ categories, activeCommand, activeChild, onSelect, query, onQueryChange, isOverview, onGoOverview }) {
  const expanded = Boolean(query.trim());

  return (
    <aside className="cmd-sidebar">
      <div className="cmd-search-row">
        <svg className="cmd-search-icon" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="cmd-search-input"
          placeholder="Search commands..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="cmd-overview-link-row">
        <OverviewLink isActive={isOverview} onClick={onGoOverview} />
      </div>
      <nav className="cmd-tree">
        {categories.map(({ name, commands, color }) => (
          <div className="cmd-tree-group" key={name}>
            <div className="cmd-tree-group-title" style={{ color }}>{name}</div>
            {commands.map((command) => (
              <TreeCommand
                key={command.name}
                command={command}
                isActive={activeCommand === command.name}
                activeChild={activeChild}
                expanded={expanded}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
        {categories.length === 0 && <p className="cmd-tree-empty">No commands match your search.</p>}
      </nav>
    </aside>
  );
}