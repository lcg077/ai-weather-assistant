import { Request, Response } from "express";
import { generateAnswer } from "../services/ai.service";

export async function askAI(req: Request, res: Response) {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const answer = await generateAnswer({ question, context });

    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(503).json({ error: "AI service unavailable" });
  }
}
