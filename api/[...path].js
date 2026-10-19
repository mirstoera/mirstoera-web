import { createApp } from '../apps/api/dist/app.js';
import { runMigrations, runSeeds } from '../packages/database/dist/index.js';

let appInstance = null;
let initialized = false;

async function getApp() {
  if (!appInstance) {
    if (!process.env.DATABASE_PATH || process.env.DATABASE_PATH.startsWith('./data')) {
      process.env.DATABASE_PATH = '/tmp/momera.sqlite';
    }
    const { app, db } = createApp();
    if (!initialized) {
      try {
        await runMigrations(db);
        await runSeeds(db);
      } catch (err) {
        console.error('[Vercel Serverless] Migration/Seed error:', err);
      }
      initialized = true;
    }
    appInstance = app;
  }
  return appInstance;
}

export default async function handler(req, res) {
  try {
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('[API Handler Error]:', err);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        error: {
          code: 'SERVER_INITIALIZATION_ERROR',
          message: err?.message || 'Server initialization failed on serverless container.',
        },
      })
    );
  }
}
