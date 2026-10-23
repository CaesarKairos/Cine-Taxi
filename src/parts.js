// Shared wheel geometry, parameterized by the current configuration.
export const wheel = (s, x, y, rx = 24, ry = 45) =>
  `<g><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#20272c"/><ellipse cx="${x + 3}" cy="${y - 2}" rx="${rx * 0.67}" ry="${ry * 0.72}" fill="${s.wheels === "dark" ? "#414950" : "#a6afb0"}"/><ellipse cx="${x + 5}" cy="${y - 2}" rx="${rx * 0.45}" ry="${ry * 0.54}" fill="#333c43"/>${Array.from(
    { length: s.wheels === "sport" ? 5 : 8 },
    (_, i) => {
      let a = (i * Math.PI * 2) / (s.wheels === "sport" ? 5 : 8);
      return `<path d="M${x + 5} ${y - 2}l${Math.cos(a) * rx * 0.5} ${Math.sin(a) * ry * 0.59}" stroke="${s.wheels === "dark" ? "#69757c" : "#d5dbd6"}" stroke-width="${s.wheels === "sport" ? 5 : 2}"/>`;
    },
  ).join(
    "",
  )}<ellipse cx="${x + 5}" cy="${y - 2}" rx="5" ry="8" fill="#dfd8c6"/></g>`;
