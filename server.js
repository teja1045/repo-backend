import express from "express";
import cors from "cors";
import { calculateTeklaQuote, DEFAULT_INPUT } from "./pricing.js";

if (!process.env.PORT) {
  throw new Error("Missing required environment variable: PORT");
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Environment variable PORT must be a valid positive integer");
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "project-quote-backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/defaults", (_req, res) => {
  res.status(200).json({ defaults: DEFAULT_INPUT });
});

app.post("/api/quote", (req, res) => {
  try {
    const quote = calculateTeklaQuote(req.body || {});
    res.status(200).json({ success: true, quote });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to generate quote from provided input.",
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

app.listen(port, () => {
  console.log(`✅ Tekla quote backend running on http://localhost:${port}`);
});
