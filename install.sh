#!/usr/bin/env bash
# url4fun Linux / macOS installer
set -e

echo ""
echo "  ┌─────────────────────────────────┐"
echo "  │   url4fun – URL Shortener CLI   │"
echo "  └─────────────────────────────────┘"
echo ""

command_exists() {
  command -v "$1" &>/dev/null
}

if command_exists npm; then
  echo "  ✔ npm found – installing url4fun globally via npm..."
  npm install -g github:pulkitrais/url4fun
  echo ""
  echo "  ✔ Installation complete. Run 'url4fun --help' to get started."
else
  echo "  ✗ npm was not found."
  echo ""
  echo "  Please install Node.js (https://nodejs.org) and then run:"
  echo "    npm install -g github:pulkitrais/url4fun"
  exit 1
fi
