'use strict';

const crypto = require('crypto');

const PLATFORM_PREFIXES = {
  youtube:     'yt',
  spotify:     'sp',
  'apple-music': 'am',
  twitter:     'tw',
  tiktok:      'tt',
  instagram:   'ig',
  linkedin:    'li',
  facebook:    'fb',
  github:      'gh',
  generic:     'u',
};

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_PREFIXES);

function detectPlatform(url) {
  let hostname = '';
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return 'generic';
  }

  if (hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'youtu.be') return 'youtube';
  if (hostname === 'spotify.com' || hostname === 'open.spotify.com') return 'spotify';
  if (hostname === 'music.apple.com') return 'apple-music';
  if (hostname === 'twitter.com' || hostname === 'www.twitter.com' || hostname === 'x.com' || hostname === 'www.x.com') return 'twitter';
  if (hostname === 'tiktok.com' || hostname === 'www.tiktok.com' || hostname === 'vm.tiktok.com') return 'tiktok';
  if (hostname === 'instagram.com' || hostname === 'www.instagram.com') return 'instagram';
  if (hostname === 'linkedin.com' || hostname === 'www.linkedin.com') return 'linkedin';
  if (hostname === 'facebook.com' || hostname === 'www.facebook.com' || hostname === 'fb.com') return 'facebook';
  if (hostname === 'github.com' || hostname === 'www.github.com') return 'github';
  return 'generic';
}

function generateShortCode(platform) {
  const prefix = PLATFORM_PREFIXES[platform] || PLATFORM_PREFIXES.generic;
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${rand}`;
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function buildShortUrl(host, shortCode) {
  return `http://${host}/${shortCode}`;
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {
  detectPlatform,
  generateShortCode,
  generateId,
  buildShortUrl,
  validateUrl,
  SUPPORTED_PLATFORMS,
  PLATFORM_PREFIXES,
};
