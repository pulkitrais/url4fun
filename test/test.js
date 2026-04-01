'use strict';

const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Use a temp dir for tests so we don't pollute user data
const TEST_DB_DIR = path.join(os.tmpdir(), 'url4fun-test-' + process.pid);
fs.mkdirSync(TEST_DB_DIR, { recursive: true });
process.env.URL4FUN_DATA_DIR = TEST_DB_DIR;

const shortener = require('../src/shortener');
const db = require('../src/database');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✔ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n  ── Shortener Tests ──────────────────────\n');

test('detectPlatform returns youtube for youtube.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://www.youtube.com/watch?v=abc'), 'youtube');
});

test('detectPlatform returns youtube for youtu.be URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://youtu.be/abc123'), 'youtube');
});

test('detectPlatform returns spotify for spotify.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://open.spotify.com/track/abc'), 'spotify');
});

test('detectPlatform returns apple-music for music.apple.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://music.apple.com/us/album/abc'), 'apple-music');
});

test('detectPlatform returns twitter for twitter.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://twitter.com/user/status/123'), 'twitter');
});

test('detectPlatform returns twitter for x.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://x.com/user/status/123'), 'twitter');
});

test('detectPlatform returns tiktok for tiktok.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://www.tiktok.com/@user/video/123'), 'tiktok');
});

test('detectPlatform returns instagram for instagram.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://www.instagram.com/p/abc/'), 'instagram');
});

test('detectPlatform returns linkedin for linkedin.com URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://www.linkedin.com/in/user'), 'linkedin');
});

test('detectPlatform returns generic for unknown URLs', () => {
  assert.strictEqual(shortener.detectPlatform('https://example.com/page'), 'generic');
});

test('generateShortCode uses correct prefix for youtube', () => {
  const code = shortener.generateShortCode('youtube');
  assert.ok(code.startsWith('yt-'), `Expected code starting with "yt-", got "${code}"`);
});

test('generateShortCode uses correct prefix for spotify', () => {
  const code = shortener.generateShortCode('spotify');
  assert.ok(code.startsWith('sp-'), `Expected code starting with "sp-", got "${code}"`);
});

test('generateShortCode produces unique codes', () => {
  const codes = new Set(Array.from({ length: 100 }, () => shortener.generateShortCode('generic')));
  assert.strictEqual(codes.size, 100, 'Codes are not unique');
});

test('validateUrl accepts https URLs', () => {
  assert.ok(shortener.validateUrl('https://example.com'));
});

test('validateUrl accepts http URLs', () => {
  assert.ok(shortener.validateUrl('http://example.com'));
});

test('validateUrl rejects plain strings', () => {
  assert.ok(!shortener.validateUrl('not-a-url'));
});

test('validateUrl rejects ftp URLs', () => {
  assert.ok(!shortener.validateUrl('ftp://example.com'));
});

test('buildShortUrl constructs correct URL', () => {
  const result = shortener.buildShortUrl('localhost:3000', 'yt-abcd1234');
  assert.strictEqual(result, 'http://localhost:3000/yt-abcd1234');
});

console.log('\n  ── Database Tests ───────────────────────\n');

test('saveUrl and getUrlByCode round-trip', () => {
  const id   = shortener.generateId();
  const code = shortener.generateShortCode('youtube');
  db.saveUrl(id, 'https://youtube.com/watch?v=test', code, 'youtube');
  const row = db.getUrlByCode(code);
  assert.ok(row, 'Row should exist');
  assert.strictEqual(row.original, 'https://youtube.com/watch?v=test');
  assert.strictEqual(row.platform, 'youtube');
});

test('listUrls returns saved entries', () => {
  const id   = shortener.generateId();
  const code = shortener.generateShortCode('spotify');
  db.saveUrl(id, 'https://open.spotify.com/track/xyz', code, 'spotify');
  const list = db.listUrls();
  assert.ok(list.length >= 1);
  assert.ok(list.some(r => r.short_code === code));
});

test('recordClick increments click_count', () => {
  const id   = shortener.generateId();
  const code = shortener.generateShortCode('twitter');
  db.saveUrl(id, 'https://twitter.com/test', code, 'twitter');
  db.recordClick(id, '1.2.3.4', 'TestAgent/1.0');
  const row = db.getUrlByCode(code);
  assert.strictEqual(row.click_count, 1);
});

test('getClicksForUrl returns click log', () => {
  const id   = shortener.generateId();
  const code = shortener.generateShortCode('instagram');
  db.saveUrl(id, 'https://instagram.com/p/test', code, 'instagram');
  db.recordClick(id, '10.0.0.1', 'Mozilla/5.0');
  db.recordClick(id, '10.0.0.2', 'curl/7.x');
  const clicks = db.getClicksForUrl(id);
  assert.strictEqual(clicks.length, 2);
  assert.ok(clicks.some(c => c.ip === '10.0.0.1'));
  assert.ok(clicks.some(c => c.ip === '10.0.0.2'));
});

test('deleteUrl removes the entry', () => {
  const id   = shortener.generateId();
  const code = shortener.generateShortCode('linkedin');
  db.saveUrl(id, 'https://linkedin.com/in/user', code, 'linkedin');
  const deleted = db.deleteUrl(code);
  assert.ok(deleted);
  const row = db.getUrlByCode(code);
  assert.strictEqual(row, undefined);
});

test('deleteUrl returns false for unknown code', () => {
  const result = db.deleteUrl('nonexistent-code');
  assert.ok(!result);
});

// Clean up test DB
try { fs.rmSync(TEST_DB_DIR, { recursive: true }); } catch {}

console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
