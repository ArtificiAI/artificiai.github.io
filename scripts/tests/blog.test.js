// Tests du blogue : `npm test`. Chaque test génère le site dans un dossier temporaire.

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { BlogValidationError, loadArticles } from '../lib/blog.js';
import { buildSite, root } from '../lib/site.js';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const temporaryDirs = [];

async function build(options) {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'artifici-blogue-'));
  temporaryDirs.push(outDir);
  await buildSite({ outDir, ...options });
  return {
    outDir,
    read: (file) => readFile(path.join(outDir, file), 'utf8'),
    exists: (file) => stat(path.join(outDir, file)).then(() => true, () => false),
  };
}

async function allFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile()).map((e) => path.join(e.parentPath ?? e.path, e.name));
}

const jsonLd = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

after(() => Promise.all(temporaryDirs.map((dir) => rm(dir, { recursive: true, force: true }))));

describe('site de production', () => {
  let site;
  before(async () => {
    site = await build({ articlesDir: path.join(fixtures, 'valide') });
  });

  test('aucun brouillon n’apparaît dans la sortie (pages, liste, flux, plan du site)', async () => {
    assert.equal(await site.exists('blogue/article-secret-brouillon/index.html'), false);
    assert.equal(await site.exists('en/blog/third-article-draft/index.html'), false);
    for (const file of await allFiles(site.outDir)) {
      const text = await readFile(file, 'utf8');
      for (const secret of ['article-secret-brouillon', 'Article secret', 'third-article-draft', 'Third article, English draft']) {
        assert.ok(!text.includes(secret), `« ${secret} » trouvé dans ${path.relative(site.outDir, file)}`);
      }
    }
  });

  test('la liste présente les articles publiés du plus récent au plus ancien', async () => {
    const html = await site.read('blogue/index.html');
    const order = ['/blogue/deuxieme-article/', '/blogue/premier-article/', '/blogue/troisieme-article/'].map((url) => html.indexOf(`href="${url}"`));
    assert.ok(order.every((i) => i > 0), 'un article publié manque dans la liste');
    assert.deepEqual([...order].sort((a, b) => a - b), order);
    assert.match(html, /<time datetime="2026-10-10">10 octobre 2026<\/time> · L’équipe Artifici/);
    assert.match(html, /<time datetime="2026-10-01">1er octobre 2026<\/time> · Francis Couture/);
    assert.ok(html.includes('IA locale'), 'catégorie affichée');
    // L’article anglais est traduit en français : il n’est pas répété dans la liste française.
    assert.ok(!html.includes('/en/blog/first-article/'));
  });

  test('la page d’un article contient son contenu, ses métadonnées et un retour à la liste', async () => {
    const html = await site.read('blogue/premier-article/index.html');
    assert.match(html, /<title>Premier article publié \| Blogue Artifici<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/artifici\.ai\/blogue\/premier-article\/">/);
    assert.match(html, /<meta property="og:type" content="article">/);
    assert.match(html, /<meta property="article:published_time" content="2026-10-01">/);
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/artifici\.ai\/en\/blog\/first-article\/">/);
    assert.match(html, /<h1[^>]*>Premier article publié<\/h1>/);
    assert.match(html, /<h2 id="section-commune">Section commune<\/h2>[\s\S]*<h2 id="section-commune-2">/);
    assert.match(html, /<figure><img src="\/img\/og-cover\.jpg" alt="Carte de partage du site" loading="lazy" decoding="async"><figcaption>Une légende de test<\/figcaption><\/figure>/);
    assert.match(html, /<pre tabindex="0"><code class="language-js">const x = 1 &lt; 2;/);
    assert.match(html, /<div class="longform-table" tabindex="0">/);
    assert.match(html, /<blockquote>/);
    assert.match(html, /href="\/blogue\/" class="btn-secondary"/);
    const posting = jsonLd(html).find((n) => n['@type'] === 'BlogPosting');
    assert.equal(posting.headline, 'Premier article publié');
    assert.equal(posting.datePublished, '2026-10-01');
    assert.equal(posting.author.name, 'Francis Couture');
  });

  test('image de couverture, date de mise à jour et auteur collectif', async () => {
    const html = await site.read('blogue/deuxieme-article/index.html');
    assert.match(html, /<meta property="og:image" content="https:\/\/artifici\.ai\/img\/og-cover\.jpg">/);
    assert.match(html, /<meta property="og:image:alt" content="Carte de partage du site Artifici">/);
    assert.match(html, /<meta property="article:modified_time" content="2026-10-12">/);
    assert.match(html, /Mis à jour le <time datetime="2026-10-12">12 octobre 2026<\/time>/);
    const posting = jsonLd(html).find((n) => n['@type'] === 'BlogPosting');
    assert.deepEqual(posting.author, { '@id': 'https://artifici.ai/#organization' });
  });

  test('un article dont la traduction est un brouillon ne pointe jamais vers elle', async () => {
    const html = await site.read('blogue/troisieme-article/index.html');
    assert.ok(!html.includes('hreflang="en" href='), 'aucune alternative de langue');
    assert.match(html, /<a href="\/en\/blog\/" lang="en" hreflang="en" data-lang="en"/);
    assert.match(html, /var en = '';/);
  });

  test('la liste anglaise inclut les articles français non traduits, signalés comme tels', async () => {
    const html = await site.read('en/blog/index.html');
    assert.ok(html.includes('href="/en/blog/first-article/"'));
    assert.ok(html.includes('href="/blogue/troisieme-article/"'));
    assert.ok(html.includes('href="/blogue/deuxieme-article/"'));
    assert.ok(!html.includes('href="/blogue/premier-article/"'), 'l’article traduit n’est pas répété');
    assert.match(html, /In French<\/span>/);
    assert.match(html, /<h2 class="[^"]*" lang="fr">/);
  });

  test('plan du site et flux RSS', async () => {
    const sitemap = await site.read('sitemap.xml');
    assert.match(sitemap, /<loc>https:\/\/artifici\.ai\/blogue\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/artifici\.ai\/blogue\/deuxieme-article\/<\/loc>\n    <lastmod>2026-10-12<\/lastmod>/);
    assert.match(sitemap, /<loc>https:\/\/artifici\.ai\/blogue\/premier-article\/<\/loc>\n    <lastmod>2026-10-01<\/lastmod>\n    <xhtml:link rel="alternate" hreflang="fr"/);

    const rss = await site.read('blogue/rss.xml');
    const links = [...rss.matchAll(/<link>(https:\/\/artifici\.ai\/blogue\/[^<]+)<\/link>/g)].map((m) => m[1]);
    assert.deepEqual(links, [
      'https://artifici.ai/blogue/deuxieme-article/',
      'https://artifici.ai/blogue/premier-article/',
      'https://artifici.ai/blogue/troisieme-article/',
    ]);
    assert.match(rss, /<pubDate>Sat, 10 Oct 2026 12:00:00 GMT<\/pubDate>/);
    assert.match(rss, /<atom:link href="https:\/\/artifici\.ai\/blogue\/rss\.xml" rel="self"/);
  });

  test('un article retiré ou repassé en brouillon ne subsiste pas d’une génération à l’autre', async () => {
    await mkdir(path.join(site.outDir, 'blogue/ancien-article'), { recursive: true });
    await buildSite({ outDir: site.outDir, articlesDir: path.join(fixtures, 'valide') });
    assert.equal(await site.exists('blogue/ancien-article'), false);
  });
});

describe('aperçu local', () => {
  test('les brouillons sont générés, signalés et exclus de l’indexation', async () => {
    const site = await build({ articlesDir: path.join(fixtures, 'valide'), includeDrafts: true });
    const html = await site.read('blogue/article-secret-brouillon/index.html');
    assert.match(html, /<meta name="robots" content="noindex">/);
    assert.match(html, /role="note"/);
    assert.ok((await site.read('blogue/index.html')).includes('>Brouillon</span>'));
    assert.ok(!(await site.read('sitemap.xml')).includes('article-secret-brouillon'));
    assert.ok(!(await site.read('blogue/rss.xml')).includes('article-secret-brouillon'));
  });
});

describe('validation des articles', () => {
  test('les erreurs de l’en-tête et du texte sont toutes signalées clairement', async () => {
    await assert.rejects(loadArticles(path.join(fixtures, 'invalide'), { siteRoot: root }), (error) => {
      assert.ok(error instanceof BlogValidationError);
      const expected = [
        'sans-titre.md : champ « titre » obligatoire',
        'champs-invalides.md : champ(s) inconnu(s) : tags',
        'champs-invalides.md : slug « Mauvais Slug » invalide',
        'champs-invalides.md : date « 1er octobre » invalide',
        'champs-invalides.md : statut « en-ligne » invalide',
        'champs-invalides.md : auteur « quelquun » inconnu',
        'champs-invalides.md : catégorie « cuisine » inconnue',
        'corps-invalide.md : image_alt obligatoire',
        'corps-invalide.md : image « /img/blogue/nexiste-pas.webp » introuvable',
        'corps-invalide.md : titre « # Un deuxième titre principal »',
        'corps-invalide.md : image « /img/og-cover.jpg » sans texte de remplacement',
        'corps-invalide.md : image « /img/blogue/absente.webp » introuvable',
      ];
      for (const message of expected) {
        assert.ok(error.problems.some((p) => p.includes(message)), `message attendu : ${message}\nreçus :\n${error.problems.join('\n')}`);
      }
      return true;
    });
  });
});

describe('contenu réel du dépôt', () => {
  test('le brouillon d’exemple n’est pas publié', async () => {
    const site = await build({});
    assert.equal(await site.exists('blogue/exemple-brouillon/index.html'), false);
    for (const file of ['blogue/index.html', 'blogue/rss.xml', 'sitemap.xml']) {
      assert.ok(!(await site.read(file)).includes('exemple-brouillon'), file);
    }
  });
});
