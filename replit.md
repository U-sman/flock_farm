# Flock Farm

A poultry farm management app — flock register, feed & expense ledger, egg production, health/vaccination tracking, and monthly summaries.

## Stack

- **Frontend:** React + TypeScript + Vite (`src/`)
- **Backend:** Express (`server/server.js`) — serves the API and the built frontend from one port
- **Database:** MongoDB Atlas (via Mongoose)

## How to run

The workflow `Start application` runs `npm run start`, which:
1. Builds the frontend (`vite build` → `dist/`)
2. Starts the Express server on port 5000

The app is available in the Replit preview pane once the server prints `🐔 Flock Farm server running on port 5000`.

## Required secrets

| Secret | Description |
|--------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |

## Environment variables

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `5000` | Required for Replit webview |

## User preferences

<!-- Add preferences here as they come up -->
