import fs from "node:fs";

const path = "src/content/reading/entries.ts";
let src = fs.readFileSync(path, "utf8");

src = src.replace(
  /(title:\s*"([^"]+)"[\s\S]*?)excerpt:\s*"[^"]*"/g,
  (_match, before, title) => `${before}excerpt: "'${title}'을 읽고"`,
);

fs.writeFileSync(path, src);
console.log("updated", (src.match(/을 읽고"/g) || []).length);
