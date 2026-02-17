import OpenAI from "openai";
import { getOpenAIClient } from "../utils/openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateWeatherAdvice(args: {
  locationName: string;
  startDateISO: string;
  endDateISO: string;
  weather: any;
}) {
  if (!process.env.OPENAI_API_KEY) return null;

  const input = `
Location: ${args.locationName}
Date range: ${args.startDateISO} to ${args.endDateISO}

Weather JSON (current snapshot):
${JSON.stringify(args.weather).slice(0, 6000)}
`.trim();

  const response = await client.responses.create({
    model: "gpt-4.1",
    instructions:
      "You are a concise travel weather assistant. " +
      "Write 3-6 short bullet points of practical advice (what to wear/bring, risks, timing). " +
      "Do not mention JSON. No fluff.",
    input,
  });

  return response.output_text?.trim() || null;
}

export async function generateAnswer({
  question,
  context,
}: {
  question: string;
  context: unknown;
}): Promise<string> {
  const client = getOpenAIClient();

  const systemPrompt = `
You are a helpful travel weather assistant.

Use the provided structured weather data to answer the user’s question.
Be concise but helpful.
Explain reasoning when comparing days.
`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Weather context:\n${JSON.stringify(context, null, 2)}`,
      },
      {
        role: "user",
        content: `Question: ${question}`,
      },
    ],
  });

  return resp.choices[0]?.message?.content ?? "No answer.";
}
