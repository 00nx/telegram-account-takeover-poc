// Telegram bot bridge: long-polls the Bot API and stores any file
// the bot receives into the local loot directory.

const fs = require('fs');
const path = require('path');
const config = require('./config');

const FILE_BASE = 'https://api.telegram.org/file/bot';

class BotBridge {
  constructor({ botToken, lootDir } = {}) {
    this.token = botToken ?? config.botToken;
    this.lootDir = lootDir ?? config.paths.loot;
    this.lastUpdateId = 0;
    this.polling = false;
  }

  get enabled() {
    return Boolean(this.token);
  }

  async downloadFile(fileId, suggestedName) {
    const api = `https://api.telegram.org/bot${this.token}`;

    const metaRes = await fetch(`${api}/getFile?file_id=${fileId}`);
    const meta = await metaRes.json();
    if (!meta.ok) throw new Error(`getFile failed: ${JSON.stringify(meta)}`);

    const binRes = await fetch(`${FILE_BASE}${this.token}/${meta.result.file_path}`);
    const buf = Buffer.from(await binRes.arrayBuffer());

    const safe = path.basename(suggestedName || `loot_${fileId}`);
    const dest = path.join(this.lootDir, safe);
    fs.writeFileSync(dest, buf);
    console.log(`  [bridge] saved ${safe} (${buf.length} bytes) -> ${dest}`);
  }

  async poll() {
    if (!this.enabled || this.polling) return;
    this.polling = true;
    try {
      const api = `https://api.telegram.org/bot${this.token}`;
      const res = await fetch(`${api}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=25`);
      const json = await res.json();
      if (json.ok) {
        for (const update of json.result) {
          this.lastUpdateId = update.update_id;
          const doc = update.message?.document;
          if (doc) await this.downloadFile(doc.file_id, doc.file_name);
        }
      }
    } catch (err) {
      console.error('[bridge]', err.message);
    } finally {
      this.polling = false;
      setTimeout(() => this.poll(), 1000);
    }
  }

  start() {
    if (!this.enabled) return false;
    this.poll();
    return true;
  }
}

module.exports = { BotBridge };
