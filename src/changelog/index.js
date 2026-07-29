import v100 from "./1.0.0.md?raw";

// Newest version first -- this array controls the render order on the page.
// To publish a new version: create src/changelog/{version}.md, import it
// above, and add it to the TOP of this array.
export const CHANGELOG_ENTRIES = [
  { version: "1.0.0", content: v100 },
];