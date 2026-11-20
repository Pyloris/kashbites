import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
const envPort = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : null;
const PORT = cliPort || envPort || 3000;


async function startServer() {
  const app = createApp();
  const frontendRoot = path.resolve(__dirname, '../../frontend');

  if (!isProduction && fs.existsSync(path.join(frontendRoot, 'index.html'))) {
    // Mount Vite dev server for frontend when running in integrated dev mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: frontendRoot,
      configFile: path.join(frontendRoot, 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(frontendRoot, 'dist'))
      ? path.join(frontendRoot, 'dist')
      : path.resolve(__dirname, '../../dist');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[KashBites Backend] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
