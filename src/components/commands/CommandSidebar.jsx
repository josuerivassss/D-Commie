function TreeCommand({ command, categoryColor, isActive, activeChild, expanded, onSelect }) {
  const hasChildren = command.children && command.children.length > 0;
  const showChildren = hasChildren && (isActive || expanded);

  return (
    <div className="cmd-tree-item">
      <button
        type="button"
        className={`cmd-tree-row ${isActive && !activeChild ? "active" : ""}`}
        onClick={() => onSelect(command.name)}
      >
        <span className="cmd-tree-dot" style={{ background: categoryColor }} />
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
              <span className="cmd-tree-name">{child.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommandSidebar({ categories, activeCommand, activeChild, onSelect, query, onQueryChange }) {
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
      <nav className="cmd-tree">
        {categories.map(({ name, commands, color }) => (
          <div className="cmd-tree-group" key={name}>
            <div className="cmd-tree-group-title" style={{ color }}>{name}</div>
            {commands.map((command) => (
              <TreeCommand
                key={command.name}
                command={command}
                categoryColor={color}
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