import v100 from "./1.0.0.md?raw";
import v110 from "./1.1.0.md?raw";
import v111 from "./1.1.1.md?raw";

// Newest version first -- this array controls the render order on the page.
// To publish a new version: create src/changelog/{version}.md, import it
// above, and add it to the TOP of this array.
export const CHANGELOG_ENTRIES = [
  { version: "1.1.1", content: v111 },
  { version: "1.1.0", content: v110 },
  { version: "1.0.0", content: v100 },
];