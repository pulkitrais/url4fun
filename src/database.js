'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.URL4FUN_DATA_DIR || path.join(os.homedir(), '.url4fun');
const DB_PATH = path.join(DATA_DIR, 'url4fun.db');

let _db = null;

function getDb() {
  if (_db) return _db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id          TEXT PRIMARY KEY,
      original    TEXT NOT NULL,
      short_code  TEXT NOT NULL UNIQUE,
      platform    TEXT DEFAULT 'generic',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      click_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      url_id      TEXT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
      ip          TEXT,
      user_agent  TEXT,
      clicked_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return _db;
}

function saveUrl(id, original, shortCode, platform) {
  const db = getDb();
  db.prepare(
    'INSERT INTO urls (id, original, short_code, platform) VALUES (?, ?, ?, ?)'
  ).run(id, original, shortCode, platform);
}

function getUrlByCode(shortCode) {
  return getDb()
    .prepare('SELECT * FROM urls WHERE short_code = ?')
    .get(shortCode);
}

function getUrlById(id) {
  return getDb()
    .prepare('SELECT * FROM urls WHERE id = ?')
    .get(id);
}

function listUrls() {
  return getDb()
    .prepare('SELECT * FROM urls ORDER BY created_at DESC')
    .all();
}

function recordClick(urlId, ip, userAgent) {
  const db = getDb();
  db.prepare(
    'INSERT INTO clicks (url_id, ip, user_agent) VALUES (?, ?, ?)'
  ).run(urlId, ip || 'unknown', userAgent || '');

  db.prepare(
    'UPDATE urls SET click_count = click_count + 1 WHERE id = ?'
  ).run(urlId);
}

function getClicksForUrl(urlId) {
  return getDb()
    .prepare('SELECT * FROM clicks WHERE url_id = ? ORDER BY clicked_at DESC')
    .all(urlId);
}

function deleteUrl(shortCode) {
  const db = getDb();
  const url = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode);
  if (!url) return false;
  db.prepare('DELETE FROM urls WHERE short_code = ?').run(shortCode);
  return true;
}

module.exports = {
  saveUrl,
  getUrlByCode,
  getUrlById,
  listUrls,
  recordClick,
  getClicksForUrl,
  deleteUrl,
  DB_PATH,
};
