type AnyRecord = Record<string, any>;

function escapeCSV(v: any) {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  const needs = /[",\n]/.test(s);
  return needs ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(items: AnyRecord[]) {
  const headers = [
    "id",
    "locationRaw",
    "locationName",
    "lat",
    "lon",
    "startDate",
    "endDate",
    "createdAt",
  ];
  const rows = items.map((it) =>
    headers.map((h) => escapeCSV(it[h])).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function toMarkdown(items: AnyRecord[]) {
  const lines = ["# Weather Requests", ""];
  for (const it of items) {
    lines.push(`## ${it.locationName ?? it.locationRaw}`);
    lines.push(`- id: ${it.id}`);
    lines.push(
      `- range: ${new Date(it.startDate).toISOString()} ~ ${new Date(it.endDate).toISOString()}`,
    );
    lines.push(`- lat/lon: ${it.lat}, ${it.lon}`);
    if (it.aiAdvice) lines.push(`- aiAdvice: ${it.aiAdvice}`);
    lines.push("");
  }
  return lines.join("\n");
}
