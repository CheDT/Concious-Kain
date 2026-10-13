import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { networkInterfaces } from 'node:os';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
const qrcode = createRequire(import.meta.url)('./assets/qrcode.min.js');
const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const lanAddresses = () => [...new Set(Object.values(networkInterfaces()).flat().filter(address => address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.')).map(address => address.address))].sort((a, b) => Number(b.startsWith('192.168.')) - Number(a.startsWith('192.168.')));
const openApp = port => {
  const url = `http://localhost:${port}/`;
  if (process.platform === 'win32') execFile('cmd.exe', ['/c', 'start', '', url], { windowsHide: true });
};
function printPhoneQR(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url); qr.make();
  const size = qr.getModuleCount();
  const border = 4;
  const dark = (row, column) => row >= 0 && column >= 0 && row < size && column < size && qr.isDark(row, column);
  console.log(`\nScan this QR code on your phone: ${url}\n`);
  for (let row = -border; row < size + border; row += 2) {
    let line = '';
    for (let column = -border; column < size + border; column++) {
      const top = dark(row, column), bottom = dark(row + 1, column);
      line += top ? bottom ? '█' : '▀' : bottom ? '▄' : ' ';
    }
    console.log(`\x1b[30;107m${line}\x1b[0m`);
  }
  console.log('Phone and computer must be connected to the same Wi-Fi.\n');
}
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep) || !types[extname(path)]) { res.writeHead(404); res.end('Not found'); return; }
    const file = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-cache' });
    res.end(file);
  } catch { res.writeHead(404); res.end('Not found'); }
});
const requestedPort = Number(process.env.PORT) || 4173;
server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${requestedPort} is already in use. Opening the existing local server.`);
    for (const address of lanAddresses()) printPhoneQR(`http://${address}:${requestedPort}/`);
    if (process.argv.includes('--open')) openApp(requestedPort);
    if (process.argv.includes('--open')) {
      process.stdin.resume();
      console.log('The server is already running. Leave its original window open. Press Ctrl+C to close this QR window.');
    }
    process.exitCode = 0;
  } else { console.error(error.message); process.exitCode = 1; }
});
server.listen(requestedPort, '0.0.0.0', () => {
  const port = server.address().port;
  console.log(`Conscious Kain is ready at http://localhost:${port}`);
  const addresses = lanAddresses();
  for (const address of addresses) printPhoneQR(`http://${address}:${port}/`);
  if (!addresses.length) console.log('Connect this computer to Wi-Fi and restart to show a phone QR code.');
  console.log('Keep this window open. Press Ctrl+C to stop the server.');
  if (process.argv.includes('--open')) openApp(port);
});
