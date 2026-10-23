import { car } from "./car.js";
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
export async function exportCar(s, kind, toast) {
  s = structuredClone(s);
  await document.fonts.ready;
  toast("Preparando sua miniatura?");
  const css = await fontStyles(s);
  let svg = car(s, { shadow: false }).replace(
    "<defs>",
    `<defs><style>${css}</style>`,
  );
  if (kind === "svg") {
    download(s, toast, new Blob([svg], { type: "image/svg+xml" }), "svg");
    return;
  }
  let size = kind === "icon" ? 256 : 1600;
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = kind === "icon" ? size : 1160;
    const ctx = canvas.getContext("2d");
    if (kind === "icon") {
      ctx.drawImage(img, -35, -32, 326, 236);
    } else ctx.drawImage(img, 0, 0, size, 1160);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    download(s, toast, blob, kind === "icon" ? "icon.png" : "png");
  } finally {
    URL.revokeObjectURL(url);
  }
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
