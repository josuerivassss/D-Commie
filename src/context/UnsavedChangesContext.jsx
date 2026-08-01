import { createContext, useCallback, useContext, useEffect, useState } from "react";
import UnsavedChangesPrompt from "../components/UnsavedChangesPrompt";

const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider({ children }) {
  const [active, setActive] = useState(false);
  const [resolver, setResolver] = useState(null);

  const setGuard = useCallback((isDirty) => {
    setActive(Boolean(isDirty));
  }, []);

  // Async replacement for window.confirm(): resolves once the person picks
  // an option on the custom bottom popup instead of blocking the thread.
  const confirmNavigation = useCallback(() => {
    if (!active) return Promise.resolve(true);
    return new Promise((resolve) => setResolver(() => resolve));
  }, [active]);

  function respond(result) {
    resolver?.(result);
    setResolver(null);
  }

  // Native tab-close/refresh warning still has to go through beforeunload --
  // browsers ignore custom text/UI here for security reasons, so this one
  // stays as the OS-native prompt. Centralized here instead of per-page so
  // every guarded form gets it automatically.
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!active) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active]);

  return (
    <UnsavedChangesContext.Provider value={{ hasUnsaved: active, setGuard, confirmNavigation }}>
      {children}
      {resolver && <UnsavedChangesPrompt onAccept={() => respond(true)} onCancel={() => respond(false)} />}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesGuard() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error("useUnsavedChangesGuard must be used inside UnsavedChangesProvider");
  return ctx;
}