import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/src/app.js';
import { connectDB } from './server/src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function bootstrap() {
  try {
    // 1. Connect database / initialize seed data
    await connectDB();

    // 2. In development, mount Vite dev server middlewares
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // In production, serve built frontend assets from dist
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api')) return next();
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }

    // 3. Listen on port 3000
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`☕ Kaapi Works running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();
