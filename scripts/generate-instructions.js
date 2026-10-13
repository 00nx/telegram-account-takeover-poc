#!/usr/bin/env node

// scripts/generate-instructions.js
// Reads .env and renders the instruction files.
//
// Default: writes to ./output/ (artifacts kept out of git).
// --deploy additionally copies them into %USERPROFILE%\Downloads\Telegram Desktop\
// so the running client can find them when the lure is clicked.

const fs = require('fs');
const os = require('os');
const path = require('path');

const config = require('../src/config');
const { writeInstructions } = require('../src/instructions');

const OUT_DIR = config.paths.output;

try {
  const written = writeInstructions(OUT_DIR);
  for (const { dest, body } of written) {
    console.log(`wrote ${dest}`);
    console.log('---');
    process.stdout.write(body);
    console.log('---');
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}

if (process.argv.includes('--deploy')) {
  const deployDir = path.join(os.homedir(), 'Downloads', 'Telegram Desktop');
  fs.mkdirSync(deployDir, { recursive: true });
  for (const name of config.instructionFiles) {
    fs.copyFileSync(path.join(OUT_DIR, name), path.join(deployDir, name));
    console.log(`deployed ${name} -> ${deployDir}`);
  }
}
