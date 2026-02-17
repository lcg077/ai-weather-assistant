import express from "express";
import cors from "cors";
import "dotenv/config";
import requestsRouter from "./routes/requests";
import forecastRouter from "./routes/forecast";
import askRouter from "./routes/ask";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/requests", requestsRouter);
app.use("/api/forecast", forecastRouter);

app.use("/api/ask", askRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: message });
  },
);

export default app;
