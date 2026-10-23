// Shared lighting, glass and chrome materials.
export function materials(s) {
  return `<defs><linearGradient id="paint" x2="0.3" y2="1"><stop stop-color="${s.color}"/><stop offset="1" stop-color="${s.color}"/></linearGradient><linearGradient id="chrome" x2="0" y2="1"><stop stop-color="#faf4df"/><stop offset=".4" stop-color="#acb8ba"/><stop offset=".5" stop-color="#5d707b"/><stop offset="1" stop-color="#dce0d5"/></linearGradient><linearGradient id="glass" x2=".6" y2="1"><stop stop-color="${s.glass === "blue" ? "#85bfc9" : s.glass === "amber" ? "#b29c6b" : "#637b81"}"/><stop offset="1" stop-color="#263b46"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="13"/></filter></defs>`;
}
