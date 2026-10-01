// Aperçu local du site, brouillons compris. Génère dans _apercu/ (ignoré par Git, jamais publié)
// et sert le site sur http://localhost:8080. Toute modification dans src/ régénère l’aperçu.
// Exécuter via `npm run apercu`.

import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { buildSite, root } from './lib/site.js';

const outDir = path.join(root, '_apercu');
const port = Number(process.env.PORT) || 8080;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function rebuild() {
  try {
    const { articles } = await buildSite({ outDir, includeDrafts: true, log: (line) => line.startsWith('⚠') && console.log(line) });
    const drafts = articles.filter((a) => a.draft).length;
    console.log(`Aperçu à jour : ${articles.length} article(s), dont ${drafts} brouillon(s) — http://localhost:${port}/blogue/`);
  } catch (error) {
    console.error(error.message);
  }
}

// Les pages générées sont cherchées dans _apercu/, puis dans le dépôt (images, CSS, polices…).
async function resolve(urlPath) {
  const clean = path.posix.normalize(decodeURIComponent(urlPath));
  for (const base of [outDir, root]) {
    let file = path.join(base, clean);
    if (!file.startsWith(base)) return null;
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
      return file;
    } catch {
      // Essayer l’emplacement suivant.
    }
  }
  return null;
}

await rebuild();

let timer;
watch(path.join(root, 'src'), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 200);
});

http
  .createServer(async (request, response) => {
    const file = await resolve(new URL(request.url, 'http://localhost').pathname);
    if (!file) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Page introuvable');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(file));
  })
  .listen(port, '127.0.0.1', () => console.log(`Aperçu (brouillons compris) : http://localhost:${port}/ — Ctrl+C pour arrêter.`));
