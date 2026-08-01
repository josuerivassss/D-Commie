import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CommandSidebar from "../components/commands/CommandSidebar";
import CommandDetail from "../components/commands/CommandDetail";
import { useCommandSearch } from "../hooks/useCommandSearch";
import { categoryMeta } from "../commands/categories";

const DATA_URL = "/commands-data.json";

function groupByCategory(commands) {
  const map = new Map();
  for (const command of commands) {
    if (!map.has(command.category)) map.set(command.category, []);
    map.get(command.category).push(command);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, list]) => ({ name, commands: list, color: categoryMeta(name).color }));
}

export default function CommandsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: null, commands: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load command data (${res.status})`);
        return res.json();
      })
      .then((data) => { if (!cancelled) setState({ loading: false, error: null, commands: data.commands || [] }); })
      .catch((err) => { if (!cancelled) setState({ loading: false, error: err.message, commands: [] }); });
    return () => { cancelled = true; };
  }, []);

  const activeCategory = searchParams.get("cat");
  const activeCommand = searchParams.get("cmd");
  const activeChild = searchParams.get("subcmd");
  const filtered = useCommandSearch(state.commands, query);
  const categories = useMemo(() => groupByCategory(filtered), [filtered]);

  function selectCategory(name) {
    setSearchParams({ cat: name }, { replace: true });
  }

  function selectCommand(name, subName) {
    const command = state.commands.find((c) => c.name === name);
    const next = { cmd: name };
    if (subName) next.subcmd = subName;
    // Keep the category in the URL so the back button returns to the
    // right category page, whether the command was reached via the
    // category grid or picked directly from the sidebar tree.
    next.cat = command ? command.category : activeCategory || "";
    if (!next.cat) delete next.cat;
    setSearchParams(next, { replace: true });
  }

  function backToOverview() {
    setSearchParams({}, { replace: true });
  }

  function backToCategory() {
    setSearchParams(activeCategory ? { cat: activeCategory } : {}, { replace: true });
  }

  if (state.loading) return <div className="center-loading">Loading commands&hellip;</div>;

  if (state.error) {
    return (
      <>
        <Header user={null} />
        <div className="cmd-page-error"><div className="flash error">{state.error}</div></div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header user={null} />
      <div className={`cmd-page ${activeCommand || activeCategory ? "cmd-detail-open" : ""}`}>
        <CommandSidebar
          categories={categories}
          activeCommand={activeCommand}
          activeChild={activeChild}
          onSelect={selectCommand}
          query={query}
          onQueryChange={setQuery}
          isOverview={!activeCategory && !activeCommand}
          onGoOverview={backToOverview}
        />
        <CommandDetail
          commands={state.commands}
          activeCategory={activeCategory}
          activeCommand={activeCommand}
          activeChild={activeChild}
          onSelectCategory={selectCategory}
          onSelectCommand={selectCommand}
          onBackToOverview={backToOverview}
          onBackToCategory={backToCategory}
        />
      </div>
      <Footer />
    </>
  );
}