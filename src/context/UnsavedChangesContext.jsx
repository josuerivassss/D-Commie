import { createContext, useCallback, useContext, useRef, useState } from "react";

const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider({ children }) {
  const [message, setMessage] = useState(null);
  const guardRef = useRef(null);

  const setGuard = useCallback((guardMessage) => {
    guardRef.current = guardMessage || null;
    setMessage(guardMessage || null);
  }, []);

  const confirmNavigation = useCallback(() => {
    if (!guardRef.current) return true;
    return window.confirm(guardRef.current);
  }, []);

  return (
    <UnsavedChangesContext.Provider value={{ hasUnsaved: Boolean(message), setGuard, confirmNavigation }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesGuard() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error("useUnsavedChangesGuard must be used inside UnsavedChangesProvider");
  return ctx;
}