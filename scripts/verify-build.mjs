import { readFile, readdir, stat } from "node:fs/promises";
import assert from "node:assert/strict";
const html = await readFile("dist/index.html", "utf8");
assert(
  !/(?:src|href)=["']\/?src\//.test(html),
  "Production HTML references source modules",
);
const references = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)];
assert(
  references.some(([, path]) => path.endsWith(".js")),
  "Missing compiled JS",
);
assert(
  (await readdir("dist/assets")).some((file) => file.endsWith(".css")),
  "Missing compiled CSS",
);
for (const [, path] of references) assert((await stat(`dist${path}`)).size > 0);
for (const file of await readdir("public/models")) {
  assert.equal(
    await readFile(`dist/models/${file}`, "utf8"),
    await readFile(`public/models/${file}`, "utf8"),
  );
}
assert(
  (await readdir("dist/assets")).some((file) => file.endsWith(".woff2")),
  "Missing local fonts",
);
console.log(
  "Production artifact verified: bundled HTML, JS, CSS, fonts and models.",
);
