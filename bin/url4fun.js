#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const chalk = require('chalk');
const Table = require('cli-table3');

const db = require('../src/database');
const shortener = require('../src/shortener');

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = `localhost:${DEFAULT_PORT}`;

program
  .name('url4fun')
  .description('A CLI URL shortener with platform-specific formats and IP click tracking')
  .version('1.0.0');

// ─── url4fun create <url> ────────────────────────────────────────────────────
program
  .command('create <url>')
  .description('Create a shortened URL')
  .option('-p, --platform <platform>', 'Force a specific platform prefix (youtube, spotify, apple-music, twitter, tiktok, instagram, linkedin, facebook, github)')
  .option('--host <host>', 'Host used in the shortened URL', DEFAULT_HOST)
  .action((url, options) => {
    if (!shortener.validateUrl(url)) {
      console.error(chalk.red('\n  ✗ Invalid URL. Please include http:// or https://\n'));
      process.exit(1);
    }

    const platform = options.platform
      ? options.platform.toLowerCase()
      : shortener.detectPlatform(url);

    if (options.platform && !shortener.SUPPORTED_PLATFORMS.includes(platform)) {
      console.error(chalk.red(`\n  ✗ Unknown platform "${platform}". Supported: ${shortener.SUPPORTED_PLATFORMS.join(', ')}\n`));
      process.exit(1);
    }

    const id        = shortener.generateId();
    const shortCode = shortener.generateShortCode(platform);
    const shortUrl  = shortener.buildShortUrl(options.host, shortCode);

    db.saveUrl(id, url, shortCode, platform);

    console.log(chalk.bold('\n  ✔ Short URL created!\n'));
    console.log(`  ${chalk.cyan('Original :')} ${url}`);
    console.log(`  ${chalk.cyan('Short URL:')} ${chalk.green(shortUrl)}`);
    console.log(`  ${chalk.cyan('Platform :')} ${platform}`);
    console.log(`  ${chalk.cyan('Code     :')} ${shortCode}`);
    console.log(chalk.gray('\n  Run `url4fun serve` to start the redirect server.\n'));
  });

// ─── url4fun list ────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all shortened URLs and their click counts')
  .option('--host <host>', 'Host to display in short URLs', DEFAULT_HOST)
  .action((options) => {
    const urls = db.listUrls();

    if (urls.length === 0) {
      console.log(chalk.yellow('\n  No shortened URLs yet. Use `url4fun create <url>` to add one.\n'));
      return;
    }

    const table = new Table({
      head: [
        chalk.bold('Code'),
        chalk.bold('Platform'),
        chalk.bold('Short URL'),
        chalk.bold('Clicks'),
        chalk.bold('Created'),
        chalk.bold('Original'),
      ],
      style: { head: [], border: [] },
    });

    for (const row of urls) {
      table.push([
        row.short_code,
        row.platform,
        shortener.buildShortUrl(options.host, row.short_code),
        String(row.click_count),
        row.created_at,
        truncate(row.original, 50),
      ]);
    }

    console.log('\n' + table.toString() + '\n');
  });

// ─── url4fun stats <code> ────────────────────────────────────────────────────
program
  .command('stats <code>')
  .description('Show click statistics and IP logs for a shortened URL')
  .option('--host <host>', 'Host to display in short URLs', DEFAULT_HOST)
  .action((code, options) => {
    const record = db.getUrlByCode(code);

    if (!record) {
      console.error(chalk.red(`\n  ✗ No URL found with code "${code}"\n`));
      process.exit(1);
    }

    const clicks = db.getClicksForUrl(record.id);

    console.log(chalk.bold('\n  ── URL Stats ──────────────────────────────────\n'));
    console.log(`  ${chalk.cyan('Code     :')} ${record.short_code}`);
    console.log(`  ${chalk.cyan('Short URL:')} ${shortener.buildShortUrl(options.host, record.short_code)}`);
    console.log(`  ${chalk.cyan('Original :')} ${record.original}`);
    console.log(`  ${chalk.cyan('Platform :')} ${record.platform}`);
    console.log(`  ${chalk.cyan('Created  :')} ${record.created_at}`);
    console.log(`  ${chalk.cyan('Clicks   :')} ${chalk.green(record.click_count)}`);

    if (clicks.length === 0) {
      console.log(chalk.gray('\n  No clicks recorded yet.\n'));
      return;
    }

    console.log(chalk.bold('\n  ── Click Log ──────────────────────────────────\n'));

    const table = new Table({
      head: [chalk.bold('#'), chalk.bold('IP Address'), chalk.bold('Timestamp'), chalk.bold('User Agent')],
      style: { head: [], border: [] },
    });

    clicks.forEach((c, i) => {
      table.push([
        String(i + 1),
        c.ip,
        c.clicked_at,
        truncate(c.user_agent, 40),
      ]);
    });

    console.log(table.toString() + '\n');
  });

// ─── url4fun serve ───────────────────────────────────────────────────────────
program
  .command('serve')
  .description('Start the local redirect server to track clicks')
  .option('-p, --port <port>', 'Port to listen on', String(DEFAULT_PORT))
  .action((options) => {
    const { startServer } = require('../src/server');
    startServer(options.port);
  });

// ─── url4fun delete <code> ───────────────────────────────────────────────────
program
  .command('delete <code>')
  .description('Delete a shortened URL by its code')
  .action((code) => {
    const deleted = db.deleteUrl(code);
    if (deleted) {
      console.log(chalk.green(`\n  ✔ URL with code "${code}" deleted.\n`));
    } else {
      console.error(chalk.red(`\n  ✗ No URL found with code "${code}"\n`));
      process.exit(1);
    }
  });

program.parse(process.argv);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
