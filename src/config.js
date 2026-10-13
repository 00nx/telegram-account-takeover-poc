const path = require('path');

require('dotenv').config();

const ROOT = path.join(__dirname, '..');

const instructionFiles = (process.env.INSTRUCTION_FILES ||
  'instructions1.txt,instructions2.txt,instructions3.txt')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const config = {
  port: Number(process.env.PORT) || 3000,
  botToken: process.env.BOT_TOKEN || '',
  channelId: process.env.CHANNEL_ID || '',
  tdataPrefix: process.env.TDATA_PREFIX || 'tdata',
  instructionFiles,
  paths: {
    root: ROOT,
    output: path.join(ROOT, 'output'),
    loot: path.join(ROOT, 'loot'),
  },
};

module.exports = config;
