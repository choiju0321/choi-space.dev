import { readFile } from "node:fs/promises";
import path from "node:path";

const ABOUT_MDX_PATH = path.join(
  process.cwd(),
  "src/content/mdx/about.mdx",
);

export async function getAboutMdxSource(): Promise<string> {
  return readFile(ABOUT_MDX_PATH, "utf8");
}
