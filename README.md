# url4fun

A professional **command-line URL shortener** with platform-specific short codes and built-in IP click tracking.  
Works on **Windows**, **Linux**, and **macOS** — runs entirely in the terminal.

---

## Features

| Feature | Details |
|---------|---------|
| Platform-aware short codes | `yt-`, `sp-`, `am-`, `tw-`, `tt-`, `ig-`, `li-`, `fb-`, `gh-` prefixes |
| Auto-detection | Detects YouTube, Spotify, Apple Music, Twitter/X, TikTok, Instagram, LinkedIn, Facebook, GitHub |
| IP tracking | Captures visitor IP + User-Agent on every click |
| Local storage | SQLite database stored in `~/.url4fun/` – no cloud required |
| Redirect server | Built-in Express server to serve redirects and log clicks |
| CLI-only | Pure terminal interface, no web UI needed |

---

## Installation

### Option 1 – npm (recommended)

```bash
# From npm registry
npm install -g url4fun

# Or directly from GitHub
npm install -g github:pulkitrais/url4fun
```

### Option 2 – One-line installer

**Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/pulkitrais/url4fun/main/install.sh | bash
```

**Windows** – download and run [`install.bat`](install.bat), or in PowerShell:

```powershell
npm install -g github:pulkitrais/url4fun
```

### Requirements

- **Node.js ≥ 14** – download from <https://nodejs.org>

---

## Quick Start

```bash
# 1. Create a shortened URL (auto-detects platform)
url4fun create https://www.youtube.com/watch?v=dQw4w9WgXcQ

# 2. Start the redirect server (default port 3000)
url4fun serve

# 3. Share the printed short URL – clicks are tracked automatically
```

---

## Commands

### `url4fun create <url>`

Create a shortened URL. Platform is auto-detected from the URL.

```bash
url4fun create https://www.youtube.com/watch?v=dQw4w9WgXcQ
# → http://localhost:3000/yt-a1b2c3d4

url4fun create https://open.spotify.com/track/abc --platform spotify
# → http://localhost:3000/sp-a1b2c3d4

url4fun create https://example.com --host myserver.com:4000
# → http://myserver.com:4000/u-a1b2c3d4
```

**Options:**

| Flag | Description |
|------|-------------|
| `-p, --platform <name>` | Force a platform prefix |
| `--host <host>` | Custom host for the short URL (default: `localhost:3000`) |

**Supported platforms:** `youtube`, `spotify`, `apple-music`, `twitter`, `tiktok`, `instagram`, `linkedin`, `facebook`, `github`

---

### `url4fun list`

Display all shortened URLs with click counts.

```bash
url4fun list
```

---

### `url4fun stats <code>`

View detailed click statistics and IP logs for a short code.

```bash
url4fun stats yt-a1b2c3d4
```

Sample output:

```
  ── URL Stats ──────────────────────────────────

  Code     : yt-a1b2c3d4
  Short URL: http://localhost:3000/yt-a1b2c3d4
  Original : https://www.youtube.com/watch?v=dQw4w9WgXcQ
  Platform : youtube
  Created  : 2026-04-01 12:00:00
  Clicks   : 3

  ── Click Log ──────────────────────────────────

  ┌───┬─────────────┬─────────────────────┬──────────────────────────┐
  │ # │ IP Address  │ Timestamp           │ User Agent               │
  ├───┼─────────────┼─────────────────────┼──────────────────────────┤
  │ 1 │ 1.2.3.4     │ 2026-04-01 12:05:00 │ Mozilla/5.0 (Windows…)   │
  │ 2 │ 5.6.7.8     │ 2026-04-01 12:06:00 │ curl/7.88.1              │
  │ 3 │ 9.10.11.12  │ 2026-04-01 12:07:00 │ python-requests/2.28.0   │
  └───┴─────────────┴─────────────────────┴──────────────────────────┘
```

---

### `url4fun serve`

Start the local redirect server.

```bash
url4fun serve               # default port 3000
url4fun serve --port 8080   # custom port
```

When a visitor hits a short URL the server:
1. Looks up the original URL in the local database
2. Records the visitor's **IP address**, **User-Agent**, and timestamp
3. Redirects the visitor (HTTP 301) to the original URL

---

### `url4fun delete <code>`

Remove a shortened URL.

```bash
url4fun delete yt-a1b2c3d4
```

---

## How IP Tracking Works

```
Visitor ──► http://localhost:3000/yt-a1b2c3d4
               │
               ▼
         url4fun serve (Express)
               │  logs IP + User-Agent to SQLite
               │
               ▼
         301 Redirect ──► https://www.youtube.com/watch?v=…
```

- IPs are stored in `~/.url4fun/url4fun.db` (SQLite)
- View them any time with `url4fun stats <code>`
- Works behind proxies (trusts `X-Forwarded-For` header)

---

## Project Structure

```
url4fun/
├── bin/
│   └── url4fun.js       # CLI entry point (commander.js)
├── src/
│   ├── database.js      # SQLite helpers (better-sqlite3)
│   ├── shortener.js     # Short code generation & platform detection
│   └── server.js        # Express redirect server
├── test/
│   └── test.js          # Unit tests (Node built-in assert)
├── install.sh           # Linux / macOS one-line installer
├── install.bat          # Windows batch installer
├── package.json
└── README.md
```

---

## Development

```bash
git clone https://github.com/pulkitrais/url4fun.git
cd url4fun
npm install
npm test          # run unit tests
node bin/url4fun.js --help
```

---

## License

[Apache-2.0](LICENSE)
