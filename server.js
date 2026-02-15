const { createServer } = require("http");
const { parse: parseUrl } = require("url");
const { readFileSync, existsSync } = require("fs");
const { calculateTeklaQuote, DEFAULT_INPUT } = require("./pricing");

function loadEnvFile() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

if (!process.env.PORT) {
  throw new Error("Missing required environment variable: PORT");
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Environment variable PORT must be a valid positive integer");
}

const corsOrigin = process.env.CORS_ORIGIN || "*";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = parseUrl(req.url || "", true);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "project-quote-backend",
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/defaults") {
    sendJson(res, 200, { defaults: DEFAULT_INPUT });
    return;
  }

  if (req.method === "POST" && pathname === "/api/quote") {
    try {
      const body = await parseJsonBody(req);
      const quote = calculateTeklaQuote(body);
      sendJson(res, 200, { success: true, quote });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        message: "Unable to generate quote from provided input.",
        error: error.message
      });
    }
    return;
  }

  sendJson(res, 404, {
    success: false,
    message: `Route ${req.method} ${pathname} not found.`
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Tekla quote backend running on http://localhost:${port}`);
});
