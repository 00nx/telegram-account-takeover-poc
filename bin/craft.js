#!/usr/bin/env node

// bin/craft.js — CLI for building the tg:// payload.
//
// Usage:
//   node bin/craft.js
//   node bin/craft.js --files instructions1.txt,instructions2.txt

const { craftRedirect, splitCommands } = require('../src/payload');
const config = require('../src/config');

function parseArgs(argv) {
  const args = argv.slice(2);
  const idx = args.indexOf('--files');
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return config.instructionFiles;
}

const files = parseArgs(process.argv);
const payload = craftRedirect(files);

console.log('Files targeted:');
for (const file of files) console.log(`  - ${file}`);

console.log('\nCrafted tg:// payload:\n');
console.log(payload);

console.log('\nCommands as the running instance would see them:\n');
for (const cmd of splitCommands(payload)) console.log(`  ${cmd}`);
