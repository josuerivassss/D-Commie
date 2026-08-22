import { useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useKeyedCooldown } from "../hooks/useKeyedCooldown";
import { CommandIcon, SubcommandIcon } from "../components/commands/CommandSidebar";
import Toggle from "../components/Toggle";

const DATA_URL = "/commands-data.json";
const ALL_CATEGORY = "__all__";

function rootIdOf(id) {
  return id.split(".", 1)[0];
}

function flattenToggleable(commands) {
  const rows = [];
  const categoryIds = {};
  for (const command of commands) {
    if (command.category_id) categoryIds[command.category] = command.category_id;
    if (!command.protected && command.toggle_id) {
      rows.push({ id: command.toggle_id, rootId: command.toggle_id, name: command.name, category: command.category, description: command.description, isSub: false });
    }
    for (const child of command.children || []) {
      if (!child.protected && child.toggle_id) {
        rows.push({ id: child.toggle_id, rootId: rootIdOf(child.toggle_id), name: `${command.name} ${child.name}`, category: command.category, description: child.description, parent: command.name, isSub: true });
      }
    }
  }
  return { rows, categoryIds };
}

function CommandDetailModal({ row, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{row.name}</h3>
        <p className="cmd-description">{row.description || t("commandsToggle.noDescription")}</p>
        <div className="form-actions-row">
          <Link className="btn btn-outline" to={`/commands?cat=${row.category}&cmd=${row.parent || row.name}`}>
            {t("commandsToggle.viewFullHelp")}
          </Link>
          <button type="button" className="btn btn-primary" onClick={onClose}>{t("embeds.close")}</button>
        </div>
      </div>
    </div>
  );
}

export default function CommandsSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const cooldown = useKeyedCooldown(10);
  const [rows, setRows] = useState([]);
  const [categoryIds, setCategoryIds] = useState({});
  const [disabled, setDisabled] = useState(new Set());
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeRow, setActiveRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([fetch(DATA_URL).then((r) => r.json()), api.getGuildDisabledCommands(guild.id)])
      .then(([data, toggleState]) => {
        if (cancelled) return;
        const { rows: flat, categoryIds: catIds } = flattenToggleable(data.commands || []);
        setRows(flat);
        setCategoryIds(catIds);
        setDisabled(new Set(toggleState.disabled || []));
      })
      .catch((err) => { if (!cancelled) setLoadError(friendlyErrorMessage(err, t)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [guild.id]);

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).sort(), [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (activeCategory !== ALL_CATEGORY && r.category !== activeCategory) return false;
      if (!needle) return true;
      return r.name.toLowerCase().includes(needle) || r.category.toLowerCase().includes(needle);
    });
  }, [rows, query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of filtered) {
      if (!map.has(row.category)) map.set(row.category, []);
      map.get(row.category).push(row);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function isRowEffectivelyDisabled(row, categoryId) {
    return disabled.has(row.id) || disabled.has(row.rootId) || (categoryId && disabled.has(categoryId));
  }

    async function applyToggle(ids, enabled) {
    const primaryId = ids[0];
    setPendingId(primaryId);
    try {
      if (ids.length > 1) {
        await api.toggleManyGuildCommands(guild.id, { ids, enabled });
      } else {
        await api.toggleGuildCommand(guild.id, { id: primaryId, enabled });
      }
      setDisabled((prev) => {
        const next = new Set(prev);
        for (const id of ids) enabled ? next.delete(id) : next.add(id);
        return next;
      });
      cooldown.start(primaryId);
      showToast(t("common.saved"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRowToggle(row, nextEnabled) {
    const ids = nextEnabled && !row.isSub
      ? [row.id, ...rows.filter((r) => r.rootId === row.id && r.id !== row.id && disabled.has(r.id)).map((r) => r.id)]
      : [row.id];
    await applyToggle(ids, nextEnabled);
  }

  async function handleCategoryToggle(category, nextEnabled) {
    const categoryId = categoryIds[category];
    if (!categoryId) return;
    const ids = nextEnabled
      ? [categoryId, ...rows.filter((r) => r.category === category && disabled.has(r.id)).map((r) => r.id)]
      : [categoryId];
    await applyToggle(ids, nextEnabled);
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("commandsToggle.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  return (
    <>
      <h1>{t("commandsToggle.title")}</h1>
      <p className="section-sub">{t("commandsToggle.subtitle")}</p>

      <div className="cmd-search-row" style={{ padding: 0, border: "none", marginBottom: "1rem" }}>
        <input
          type="text"
          className="cmd-search-input"
          placeholder={t("commandsToggle.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="cmd-overview-link-row" style={{ padding: 0, border: "none", display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className={`legal-tab ${activeCategory === ALL_CATEGORY ? "active" : ""}`}
          onClick={() => setActiveCategory(ALL_CATEGORY)}
        >
          {t("commandsToggle.allCategories")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`legal-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {grouped.map(([category, items]) => {
        const categoryId = categoryIds[category];
        const categoryDisabled = categoryId ? disabled.has(categoryId) : false;
        const categoryCooling = categoryId ? cooldown.isActive(categoryId) : false;
        return (
          <div className="card" key={category}>
            <div className="embed-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{category}</span>
              {categoryId && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "none", letterSpacing: "normal", fontWeight: 500 }}>
                  {categoryCooling
                    ? t("commandsToggle.cooldownLabel", { seconds: cooldown.remaining(categoryId) })
                    : t("commandsToggle.categoryToggleLabel")}
                  <Toggle
                    checked={!categoryDisabled}
                    onChange={(checked) => handleCategoryToggle(category, checked)}
                    label={t("commandsToggle.categoryToggleLabel")}
                    disabled={pendingId === categoryId || categoryCooling}
                  />
                </span>
              )}
            </div>
            {categoryDisabled && <p className="hint" style={{ marginBottom: "0.75rem" }}>{t("commandsToggle.categoryDisabledHint")}</p>}
            {items.map((row) => {
              const effectiveDisabled = isRowEffectivelyDisabled(row, categoryId);
              const ownDisabled = disabled.has(row.id);
              const rowCooling = cooldown.isActive(row.id);
              return (
                <div className="field toggle-row" key={row.id}>
                  <button
                    type="button"
                    className="cmd-subcommand-name"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "0.5rem", textAlign: "left" }}
                    onClick={() => setActiveRow(row)}
                  >
                    {row.isSub ? <SubcommandIcon /> : <CommandIcon />}
                    {row.name}
                  </button>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {rowCooling && <span className="hint">{t("commandsToggle.cooldownLabel", { seconds: cooldown.remaining(row.id) })}</span>}
                    {categoryDisabled && !ownDisabled && !rowCooling && <span className="hint">{t("commandsToggle.inheritedHint")}</span>}
                    <Toggle
                      checked={!effectiveDisabled}
                      onChange={(checked) => handleRowToggle(row, checked)}
                      label={row.name}
                      disabled={categoryDisabled || pendingId === row.id || rowCooling}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {activeRow && <CommandDetailModal row={activeRow} onClose={() => setActiveRow(null)} />}
    </>
  );
}