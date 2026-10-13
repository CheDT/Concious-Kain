const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const qrcode = require('../assets/qrcode.min.js');
const port = 4181;
const server = spawn(process.execPath, ['server.mjs'], { cwd: require('node:path').resolve(__dirname, '..'), env: { ...process.env, PORT: String(port) }, windowsHide: true });
let output = '';
let finished = false;
server.stdout.on('data', data => { output += data; });
server.stderr.on('data', data => { output += data; });
const timeout = setTimeout(() => { console.error('Server test timed out.'); server.kill(); process.exitCode = 1; }, 10000);
server.stdout.on('data', async () => {
  if (finished || !output.includes('Press Ctrl+C to stop')) return;
  finished = true;
  try {
    const url = output.match(/Scan this QR code on your phone: (http:\/\/[^\s]+)/)?.[1];
    assert.ok(url, 'Terminal output must include a phone QR URL');
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    const lines = [...output.matchAll(/\x1b\[30;107m([^\r\n]+)\x1b\[0m/g)].map(match => match[1]);
    const size = qr.getModuleCount(), padded = size + 8;
    assert.ok(lines.length >= Math.ceil(padded / 2));
    const bitmap = [];
    for (let y = 0; y < padded; y++) {
      const row = [];
      for (let x = 0; x < padded; x++) {
        const glyph = lines[Math.floor(y / 2)][x];
        const black = glyph === '█' || (y % 2 === 0 ? glyph === '▀' : glyph === '▄');
        const expected = y >= 4 && x >= 4 && y < size + 4 && x < size + 4 && qr.isDark(y - 4, x - 4);
        assert.equal(black, expected, `QR cell ${x},${y}`);
        row.push(black ? '0' : '255');
      }
      bitmap.push(row.join(' '));
    }
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(`http://localhost:${port}/connect.html`)).status, 404);
    const launcher = await readFile('Start Conscious Kain.bat', 'utf8');
    assert.match(launcher, /chcp 65001/);
    assert.match(launcher, /node server\.mjs --open/);
    assert.doesNotMatch(launcher, /connect\.html/);
    await mkdir('.qa', { recursive: true });
    await writeFile('.qa/terminal-qr.pgm', `P2\n${padded} ${padded}\n255\n${bitmap.join('\n')}\n`);
    console.log(JSON.stringify({ status: 'PASS', checks: ['Local server listens on the LAN and returns HTTP 200.', 'Terminal Unicode QR cells exactly match the encoded phone URL, including the quiet border.', 'The .bat enables Unicode and opens the app, with no browser QR page.', 'The removed QR page returns HTTP 404.'], url }, null, 2));
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { clearTimeout(timeout); server.kill(); }
});
server.on('exit', code => { if (!finished && code) { clearTimeout(timeout); console.error(output); process.exitCode = 1; } });
