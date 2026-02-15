# Project Quote Backend (AI Tekla Quote)

Clean Node.js backend for the **project-Quote** front end. It provides quote defaults and an AI-assisted Tekla estimate API.

## Stack
- Node.js HTTP server (no external runtime dependencies)
- Centralized pricing engine in `pricing.js`

## Project structure

```txt
project-quote-backend/
│
├── server.js
├── pricing.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Setup

```bash
npm install
npm run start
```

`npm install` succeeds without npm registry package downloads because this backend uses only Node.js built-ins.

## Environment variables

| Name | Required | Description |
|---|---|---|
| `PORT` | Yes | API server port (Render provides this automatically) |
| `CORS_ORIGIN` | No | Allowed front-end origin (defaults to `*`) |

> `PORT` is mandatory. The server exits on startup if `PORT` is missing or invalid.

## API

### `GET /health`
Health check endpoint.

### `GET /api/defaults`
Returns frontend-safe default values used for quote generation.

### `POST /api/quote`
Returns calculated Tekla estimate.

Example payload:

```json
{
  "tonnage": 36,
  "complexity": "high",
  "delivery": "rush",
  "connectionDensity": "medium",
  "includeErectionDrawings": true,
  "includeBOM": true,
  "includeFabDrawings": true
}
```

## Notes
- Input is normalized with safe defaults.
- Unsupported enum values fall back automatically.
- Tonnage is clamped from `1` to `5000`.
