// Local preview server that mirrors GitHub Pages project-site hosting.
//
// The web build is exported with `experiments.baseUrl` (e.g. "/GYM-Tracker"),
// so all asset URLs are absolute under that subpath. A plain static server
// (like `npx serve dist`) serves `dist` at the root and 404s those assets.
// This server strips the configured baseUrl prefix before resolving files, so
// http://localhost:3000/GYM-Tracker/ behaves exactly like the deployed site.

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'dist');
const port = Number(process.env.PORT) || 3000;

function readBaseUrl() {
  try {
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
    const base = appJson?.expo?.experiments?.baseUrl ?? '';
    return base.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

const baseUrl = readBaseUrl();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveFile(pathname) {
  // Map an incoming URL path to a file inside dist, accounting for baseUrl.
  let p = decodeURIComponent(pathname);
  if (baseUrl && (p === baseUrl || p.startsWith(baseUrl + '/'))) {
    p = p.slice(baseUrl.length);
  }
  if (p === '' || p === '/') p = '/index.html';

  // Prevent path traversal.
  const safe = normalize(p).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(distDir, safe);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }
  // Static export emits "<route>.html" files for each route.
  if (!existsSync(filePath) && existsSync(filePath + '.html')) {
    filePath += '.html';
  }
  // SPA ("single") output: unknown non-asset routes fall back to index.html so
  // client-side routing handles them (mirrors GitHub Pages' 404.html fallback).
  if (!existsSync(filePath) && extname(filePath) === '') {
    filePath = join(distDir, 'index.html');
  }
  return filePath;
}

if (!existsSync(distDir)) {
  console.error('No dist/ folder found. Run "npm run build:web" first.');
  process.exit(1);
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${port}`);
  const filePath = resolveFile(pathname);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end('404 Not Found');
    return;
  }

  res.setHeader('Content-Type', MIME[extname(filePath)] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  const suffix = baseUrl ? `${baseUrl}/` : '/';
  console.log(`\n  Previewing dist/ (baseUrl: "${baseUrl || '/'}")`);
  console.log(`  → http://localhost:${port}${suffix}\n`);
});
