'use strict';

const express = require('express');
const db = require('./database');
const chalk = require('chalk');

const DEFAULT_PORT = 3000;

function createApp() {
  const app = express();

  app.set('trust proxy', true);

  app.get('/:code', (req, res) => {
    const { code } = req.params;
    const record = db.getUrlByCode(code);

    if (!record) {
      return res.status(404).send(
        '<html><body style="font-family:sans-serif;text-align:center;padding:60px">' +
        '<h1>404 – Short URL not found</h1>' +
        '<p>This link does not exist or has been removed.</p>' +
        '</body></html>'
      );
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || '';
    db.recordClick(record.id, ip, ua);

    return res.redirect(301, record.original);
  });

  app.get('/', (req, res) => {
    res.send(
      '<html><body style="font-family:sans-serif;text-align:center;padding:60px">' +
      '<h1>url4fun – URL Shortener</h1>' +
      '<p>Use the CLI to create and manage shortened URLs.</p>' +
      '</body></html>'
    );
  });

  return app;
}

function startServer(port) {
  port = parseInt(port, 10) || DEFAULT_PORT;
  const app = createApp();

  const server = app.listen(port, () => {
    console.log(chalk.green(`\n  url4fun redirect server running on http://localhost:${port}\n`));
    console.log(chalk.gray('  Press Ctrl+C to stop.\n'));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(chalk.red(`  Port ${port} is already in use. Try a different port with --port <number>`));
    } else {
      console.error(chalk.red(`  Server error: ${err.message}`));
    }
    process.exit(1);
  });

  return server;
}

module.exports = { createApp, startServer };
