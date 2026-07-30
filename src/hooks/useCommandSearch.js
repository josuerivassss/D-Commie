import { useMemo } from "react";

function commandMatches(command, query) {
  const haystack = [command.name, ...(command.aliases || []), command.description || ""].join(" ").toLowerCase();
  if (haystack.includes(query)) return true;
  return (command.children || []).some((child) => commandMatches(child, query));
}

/** Filters the flat command list by name/alias/description, keeping a
 * command visible if any of its subcommands match even when the parent
 * itself doesn't. */
export function useCommandSearch(commands, query) {
  const normalized = query.trim().toLowerCase();
  return useMemo(() => {
    if (!normalized) return commands;
    return commands.filter((command) => commandMatches(command, normalized));
  }, [commands, normalized]);
}