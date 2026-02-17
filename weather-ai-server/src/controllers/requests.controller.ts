import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { buildExtras } from "../services/extras.service";
import { generateWeatherAdvice } from "../services/ai.service";

import {
  parseAndValidateCreateBody,
  parseAndValidateUpdateBody,
} from "../utils/validate";
import { toCSV, toMarkdown } from "../utils/export";
import { geocodeLocation } from "../services/geocode.service";
import { getWeather } from "../services/weather.service";

function getIdParam(req: Request): string | null {
  const id = req.params.id;
  return typeof id === "string" && id.trim().length > 0 ? id : null;
}

export async function createRequest(req: Request, res: Response) {
  const body = parseAndValidateCreateBody(req.body);

  try {
    const geo = await geocodeLocation(body.location);
    const weather = await getWeather(geo.lat, geo.lon);
    const extras = buildExtras(geo.lat, geo.lon);

    const advice = await generateWeatherAdvice({
      locationName: geo.name,
      startDateISO: body.startDate.toISOString().slice(0, 10),
      endDateISO: body.endDate.toISOString().slice(0, 10),
      weather: weather.raw,
    });

    const record = await prisma.weatherRequest.create({
      data: {
        locationRaw: body.location,
        locationName: geo.name,
        lat: geo.lat,
        lon: geo.lon,
        startDate: body.startDate,
        endDate: body.endDate,
        weatherData: weather.raw as Prisma.InputJsonValue,
        aiAdvice: advice,
        extraData: extras as Prisma.InputJsonValue,
      },
    });

    return res.status(201).json(record);
  } catch (err: any) {
    if (err?.status === 404) {
      return res.status(404).json({ error: "Location not found" });
    }
    return res
      .status(500)
      .json({ error: err?.message ?? "Failed to create request" });
  }
}

export async function listRequests(_req: Request, res: Response) {
  const items = await prisma.weatherRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
}

export async function getRequestById(req: Request, res: Response) {
  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: "id is required" });

  const item = await prisma.weatherRequest.findUnique({
    where: { id },
  });

  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
}

export async function updateRequest(req: Request, res: Response) {
  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: "id is required" });

  const body = parseAndValidateUpdateBody(req.body);

  try {
    const updated = await prisma.weatherRequest.update({
      where: { id },
      data: {
        ...(body.location
          ? { locationRaw: body.location, locationName: body.location }
          : {}),
        ...(body.lat !== undefined ? { lat: body.lat } : {}),
        ...(body.lon !== undefined ? { lon: body.lon } : {}),
        ...(body.startDate ? { startDate: body.startDate } : {}),
        ...(body.endDate ? { endDate: body.endDate } : {}),
        ...(body.weatherData ? { weatherData: body.weatherData } : {}),
        ...(body.aiAdvice !== undefined ? { aiAdvice: body.aiAdvice } : {}),
        ...(body.extraData !== undefined ? { extraData: body.extraData } : {}),
      },
    });

    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
}

export async function deleteRequest(req: Request, res: Response) {
  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    await prisma.weatherRequest.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
}

export async function exportRequests(req: Request, res: Response) {
  const format = String(req.query.format ?? "json").toLowerCase();
  const items = await prisma.weatherRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (format === "json") return res.json(items);

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    return res.send(toCSV(items));
  }

  if (format === "md" || format === "markdown") {
    res.setHeader("Content-Type", "text/markdown");
    return res.send(toMarkdown(items));
  }

  res.status(400).json({ error: "format must be json|csv|md" });
}

export async function clearAll(req: Request, res: Response) {
  await prisma.weatherRequest.deleteMany({});
  return res.status(204).send();
}
