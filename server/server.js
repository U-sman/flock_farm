import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './db.js';
import DataStore from './models/DataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const ALLOWED_KEYS = [
  'birds', 'expenses', 'feed', 'eggs', 'settings',
  'batches', 'vaccinations', 'customers', 'customerSales',
  'incubation', 'checklist', 'diary',
];

// GET /api/data/:key -> returns the stored value (or null if not set yet)
app.get('/api/data/:key', async (req, res) => {
  const { key } = req.params;
  if (!ALLOWED_KEYS.includes(key)) {
    return res.status(400).json({ error: `Unknown data key: ${key}` });
  }
  try {
    const doc = await DataStore.findOne({ key });
    res.json({ key, value: doc ? doc.value : null });
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// PUT /api/data/:key -> saves (overwrites) the value for that key
app.put('/api/data/:key', async (req, res) => {
  const { key } = req.params;
  if (!ALLOWED_KEYS.includes(key)) {
    return res.status(400).json({ error: `Unknown data key: ${key}` });
  }
  try {
    const { value } = req.body;
    const doc = await DataStore.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json({ key, value: doc.value });
  } catch (err) {
    console.error('PUT /api/data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Health check (useful for Replit / uptime pings)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Serve the built frontend (created by `npm run build` -> /dist)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Any non-API route -> serve the React app (client-side routing safe)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🐔 Flock Farm server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
