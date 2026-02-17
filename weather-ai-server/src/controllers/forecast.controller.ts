import { Request, Response } from "express";
import { geocodeLocation } from "../services/geocode.service";
import { getForecast5Day } from "../services/weather.service";

function toDate(x: unknown): Date | null {
  if (typeof x !== "string") return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getForecast(req: Request, res: Response) {
  const location = String(req.query.location ?? "").trim();
  const startDate = toDate(req.query.startDate);
  const endDate = toDate(req.query.endDate);

  if (!location) return res.status(400).json({ error: "location is required" });
  if (!startDate || !endDate)
    return res
      .status(400)
      .json({ error: "startDate and endDate are required" });
  if (startDate.getTime() > endDate.getTime())
    return res.status(400).json({ error: "startDate must be <= endDate" });

  try {
    const geo = await geocodeLocation(location);
    const raw = await getForecast5Day(geo.lat, geo.lon);

    // raw.list is 3-hour steps; group by YYYY-MM-DD
    const daily: Record<
      string,
      { temps: number[]; icons: string[]; desc: string[] }
    > = {};
    for (const item of raw.list ?? []) {
      const dt = new Date((item.dt as number) * 1000);
      const key = dt.toISOString().slice(0, 10);
      if (!daily[key]) daily[key] = { temps: [], icons: [], desc: [] };
      daily[key].temps.push(item.main?.temp);
      daily[key].icons.push(item.weather?.[0]?.icon);
      daily[key].desc.push(item.weather?.[0]?.description);
    }

    // filter by date range and summarize
    const result = Object.entries(daily)
      .filter(([day]) => {
        const d = new Date(day);
        return (
          d.getTime() >=
            new Date(startDate.toISOString().slice(0, 10)).getTime() &&
          d.getTime() <= new Date(endDate.toISOString().slice(0, 10)).getTime()
        );
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => {
        const temps = v.temps.filter((t) => typeof t === "number") as number[];
        const min = temps.length ? Math.min(...temps) : null;
        const max = temps.length ? Math.max(...temps) : null;
        return {
          day,
          min,
          max,
          icon: v.icons[0] ?? null,
          description: v.desc[0] ?? null,
        };
      });

    return res.json({
      locationName: geo.name,
      lat: geo.lat,
      lon: geo.lon,
      days: result,
    });
  } catch (err: any) {
    if (err?.status === 404)
      return res.status(404).json({ error: "Location not found" });
    return res
      .status(500)
      .json({ error: err?.message ?? "Failed to get forecast" });
  }
}
