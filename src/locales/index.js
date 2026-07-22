import en from "./en.json";
import es from "./es.json";

// Registry of available dashboard UI languages. To add a new one: create
// its JSON file (same key structure as en.json/es.json) and register it
// here -- no other code changes needed anywhere else in the app.
export const LOCALES = { en, es };
export const DEFAULT_LOCALE = "en";
export const LOCALE_CODES = Object.keys(LOCALES);