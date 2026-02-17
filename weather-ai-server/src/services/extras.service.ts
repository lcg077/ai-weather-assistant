export function buildExtras(lat: number, lon: number) {
  return {
    mapUrl: `https://www.google.com/maps?q=${lat},${lon}`,
  };
}
