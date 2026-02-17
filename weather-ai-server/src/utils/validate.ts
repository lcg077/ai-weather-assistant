function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function toDate(x: unknown): Date | null {
  if (typeof x !== "string") return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseAndValidateCreateBody(body: any) {
  if (!isNonEmptyString(body?.location))
    throw new Error("location is required");

  const startDate = toDate(body?.startDate);
  const endDate = toDate(body?.endDate);
  if (!startDate || !endDate)
    throw new Error("startDate and endDate must be valid dates");
  if (startDate.getTime() > endDate.getTime())
    throw new Error("startDate must be <= endDate");

  const lat = typeof body?.lat === "number" ? body.lat : 43.6532;
  const lon = typeof body?.lon === "number" ? body.lon : -79.3832;

  const weatherData = body?.weatherData ?? { note: "placeholder" };

  return {
    location: body.location.trim(),
    startDate,
    endDate,
    lat,
    lon,
    weatherData,
    aiAdvice: typeof body?.aiAdvice === "string" ? body.aiAdvice : undefined,
    extraData: body?.extraData ?? undefined,
  };
}

export function parseAndValidateUpdateBody(body: any) {
  const startDate = body?.startDate ? toDate(body.startDate) : null;
  const endDate = body?.endDate ? toDate(body.endDate) : null;

  if (startDate && !startDate) throw new Error("startDate invalid");
  if (endDate && !endDate) throw new Error("endDate invalid");
  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    throw new Error("startDate must be <= endDate");
  }

  return {
    location: isNonEmptyString(body?.location)
      ? body.location.trim()
      : undefined,
    lat: typeof body?.lat === "number" ? body.lat : undefined,
    lon: typeof body?.lon === "number" ? body.lon : undefined,
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
    weatherData: body?.weatherData ?? undefined,
    aiAdvice:
      typeof body?.aiAdvice === "string"
        ? body.aiAdvice
        : body?.aiAdvice === null
          ? null
          : undefined,
    extraData: body?.extraData ?? undefined,
  };
}
