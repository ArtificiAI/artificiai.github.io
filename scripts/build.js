// Génère le site de production à la racine du dépôt (les brouillons du blogue ne sont jamais inclus).
// Exécuter via `npm run build`, qui compile aussi assets/site.css.

import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { BlogValidationError } from './lib/blog.js';
import { buildSite, root } from './lib/site.js';

const fonts = ['inter-latin-wght-normal.woff2', 'inter-latin-ext-wght-normal.woff2'];

async function copyFonts() {
  const fontDir = path.join(root, 'assets/fonts');
  const fontSource = path.join(root, 'node_modules/@fontsource-variable/inter');
  await mkdir(fontDir, { recursive: true });
  for (const font of fonts) await copyFile(path.join(fontSource, 'files', font), path.join(fontDir, font));
  await copyFile(path.join(fontSource, 'LICENSE'), path.join(fontDir, 'OFL.txt'));
}

try {
  await copyFonts();
  const { articles } = await buildSite({ log: console.log });
  console.log(`Blogue : ${articles.length} article(s) publié(s).`);
} catch (error) {
  if (!(error instanceof BlogValidationError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
