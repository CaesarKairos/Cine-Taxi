import { captureVehicle } from "./vehicle/renderer.js";
import { plate } from "./plate.js";
async function fontStyles(s) {
  let styles = "";
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (
        rule.type !== CSSRule.FONT_FACE_RULE ||
        !rule.cssText.includes(s.plate.font)
      )
        continue;
      let text = rule.cssText;
      const matches = [...text.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
      for (const match of matches) {
        const blob = await (
          await fetch(new URL(match[1], sheet.href || location.href))
        ).blob();
        const data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        text = text.replace(match[0], `url("${data}")`);
      }
      styles += text;
    }
  }
  return styles;
}
export async function exportCar(s, kind, toast, view = "three-quarter") {
  s = structuredClone(s);
  await document.fonts.ready;
  toast("Preparando sua miniatura…");
  if (kind === "plate-svg") {
    const css = await fontStyles(s);
    const svg = plate(s.plate).replace("<defs>", `<defs><style>${css}</style>`);
    download(s, toast, new Blob([svg], { type: "image/svg+xml" }), "placa.svg");
    return;
  }
  const url = await captureVehicle(s, {
    width: kind === "icon" ? 256 : 1600,
    height: kind === "icon" ? 256 : 1160,
    view,
  });
  const blob = await (await fetch(url)).blob();
  download(s, toast, blob, kind === "icon" ? "icon.png" : "png");
}
function download(s, toast, blob, ext) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `mini-motor-${s.body}.${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast("Sua miniatura está pronta para sair da garagem.");
}
