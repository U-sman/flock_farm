# Flock Farm

A poultry farm management app — flock register, feed & expense ledger, egg production, health/vaccination tracking, and monthly summaries. Data is stored in **MongoDB**, served through an **Express** backend, so it works the same everywhere: your phone, your laptop, anyone else you share the link with.

## How it's set up

- **Frontend:** React + TypeScript + Vite (in `src/`)
- **Backend:** Express server (in `server/`) — connects to MongoDB and also serves the built frontend, so the whole app runs from one URL.
- **Database:** MongoDB Atlas (cloud, free tier is fine)

## Running it on Replit (recommended)

1. **Import this repo** into Replit: *Create App → Import from GitHub*.
2. Open **Secrets** (the lock icon in the left sidebar) and add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
     (Atlas → your cluster → **Connect** → **Drivers** → copy the string, then replace `<password>` with your database user's password)
3. Click **Run**. Replit will:
   - Build the frontend (`npm run build`)
   - Start the server (`node server/server.js`)
   - Give you one live URL — same as any other app you've deployed this way.

That's it — no other setup needed. The app talks to MongoDB automatically once `MONGODB_URI` is set.

## Running it locally (optional, only if you want to test on your own computer)

**Prerequisites:** Node.js

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI`
3. In one terminal: `npm run server` (starts the backend on port 3000)
4. In another terminal: `npm run dev` (starts the frontend on port 3000... actually the Vite dev server, with API calls proxied to the backend)
5. Open the local URL Vite gives you

## Notes

- All existing screens (Dashboard, Flock Register, Financial Ledger, Health Portal, Monthly Summary, Settings) work exactly as before — only *where the data is saved* changed, from your browser to MongoDB.
- If `MONGODB_URI` isn't set, the server will fail to start with a clear error message telling you to add it.

