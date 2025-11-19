// src/reports/queries/utils.js
function pad2(n) { return String(n).padStart(2, '0'); }

// "2025-10-14" -> Date local 00:00:00
function parseLocalDate(dstr) {
  if (!dstr) return null;
  const d = new Date(`${dstr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

// Converte Date (local) → ISO em UTC preservando o horário exibido ao usuário
function toIsoUTC(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

/** Normaliza intervalo inclusivo [from..to], com to exclusivo (+1 dia). */
function normalizeRange(fromStr, toStr) {
  const f = parseLocalDate(fromStr);
  const t = parseLocalDate(toStr);
  if (!f && !t) return { from: null, to: null };

  let from = f ? startOfDay(f) : null;
  let to   = t ? startOfDay(addDays(t, 1)) : null;
  if (from && to && from > to) { const tmp = from; from = to; to = tmp; }
  return { from, to };
}

module.exports = { pad2, parseLocalDate, startOfDay, addDays, toIsoUTC, normalizeRange };
