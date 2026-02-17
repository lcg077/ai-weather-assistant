const API_KEY = process.env.OPENWEATHER_API_KEY!;

export type GeoResult = {
  name: string;
  lat: number;
  lon: number;
  country: string;
};

export async function geocodeLocation(query: string): Promise<GeoResult> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Geocoding service unavailable");
  }

  const data = (await res.json()) as any[];

  if (!data.length) {
    const err = new Error("Location not found");
    (err as any).status = 404;
    throw err;
  }

  return {
    name: `${data[0].name}, ${data[0].country}`,
    lat: data[0].lat,
    lon: data[0].lon,
    country: data[0].country,
  };
}
