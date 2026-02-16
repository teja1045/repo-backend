# Project Quote Backend (AI Tekla Quote)

Clean Node.js + Express backend for the **project-Quote** front end. It provides quote defaults and an AI-assisted Tekla estimate API.

## Stack
- Node.js
- Express
- CORS middleware
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

## Environment variables

| Name | Required | Description |
|---|---|---|
| `PORT` | Yes | API server port (Render provides this automatically) |
| `CORS_ORIGIN` | No | Allowed front-end origin |

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
