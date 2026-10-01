// Articles du blogue : lecture des fichiers Markdown de src/blogue/, validation de l’en-tête et rendu HTML.

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked, Renderer } from 'marked';
import { authors, categories } from '../../src/blog-config.js';
import { escapeHtml } from './template.js';

export const LANGS = ['fr', 'en'];
export const blogPaths = { fr: '/blogue/', en: '/en/blog/' };
export const articlePath = (article) => `${blogPaths[article.lang]}${article.slug}/`;

const REQUIRED = ['titre', 'description', 'date', 'auteur', 'categorie', 'statut', 'slug'];
const OPTIONAL = ['image', 'image_alt', 'langue', 'traduction', 'mise_a_jour'];
// Variantes avec accents acceptées pour éviter les erreurs de frappe.
const KEY_ALIASES = { 'catégorie': 'categorie', 'mise_à_jour': 'mise_a_jour' };
const STATUSES = { brouillon: 'brouillon', publie: 'publié', 'publié': 'publié' };
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 220;

export class BlogValidationError extends Error {
  constructor(problems) {
    super(`Le blogue contient ${problems.length} erreur(s) :\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.problems = problems;
  }
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&[a-z]+;|&#\d+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }
  return null;
}

const exists = (file) => access(file).then(() => true, () => false);

// Rendu Markdown propre à un article : identifiants de titres uniques, images accessibles,
// blocs de code et tableaux défilables au clavier.
function markdownFor(problems, localImages) {
  const usedIds = new Map();
  const headingId = (html) => {
    const base = slugify(html.replace(/<[^>]+>/g, '')) || 'section';
    const count = usedIds.get(base) || 0;
    usedIds.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };

  return new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        if (depth === 1) {
          problems.push(`titre « # ${html.replace(/<[^>]+>/g, '')} » dans le texte : le titre de l’article vient de l’en-tête ; utilisez « ## » pour les intertitres`);
        }
        return `<h${depth} id="${headingId(html)}">${html}</h${depth}>\n`;
      },
      image({ href, title, text }) {
        if (!text.trim()) problems.push(`image « ${href} » sans texte de remplacement : écrivez ![description de l’image](${href})`);
        if (href.startsWith('/')) localImages.push(href);
        else if (!href.startsWith('https://')) problems.push(`image « ${href} » : le chemin doit commencer par /img/blogue/ (ou être une adresse https://)`);
        const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">`;
        return title ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>` : img;
      },
      paragraph({ tokens }) {
        // Une image seule sur sa ligne est rendue sans paragraphe (elle peut devenir une figure).
        if (tokens.length === 1 && tokens[0].type === 'image') return `${this.parser.parseInline(tokens)}\n`;
        return false;
      },
      code(token) {
        return Renderer.prototype.code.call(this, token).replace('<pre>', '<pre tabindex="0">');
      },
      table(token) {
        return `<div class="longform-table" tabindex="0">\n${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  });
}

async function readArticle(file, dir, siteRoot) {
  const where = path.relative(siteRoot, path.join(dir, file)).split(path.sep).join('/');
  const errors = [];
  const warnings = [];
  let parsed;
  try {
    parsed = matter(await readFile(path.join(dir, file), 'utf8'));
  } catch (error) {
    return { errors: [`${where} : en-tête illisible (${error.reason || error.message})`] };
  }

  const data = {};
  for (const [key, value] of Object.entries(parsed.data)) data[KEY_ALIASES[key] || key] = value;
  const fail = (message) => errors.push(`${where} : ${message}`);

  const unknown = Object.keys(data).filter((k) => !REQUIRED.includes(k) && !OPTIONAL.includes(k));
  if (unknown.length) fail(`champ(s) inconnu(s) : ${unknown.join(', ')} (champs permis : ${[...REQUIRED, ...OPTIONAL].join(', ')})`);
  const missing = REQUIRED.filter((key) => data[key] === undefined || data[key] === null || data[key] === '');
  for (const key of missing) fail(`champ « ${key} » obligatoire`);
  if (missing.length) return { errors };

  const text = (key) => (typeof data[key] === 'string' ? data[key].trim() : String(data[key]));
  const title = text('titre');
  const description = text('description');
  const slug = text('slug');
  const lang = data.langue === undefined ? 'fr' : text('langue');
  const date = isoDate(data.date);
  const updated = data.mise_a_jour === undefined ? null : isoDate(data.mise_a_jour);
  const status = STATUSES[text('statut').toLowerCase()];

  if (!SLUG.test(slug)) fail(`slug « ${slug} » invalide : lettres minuscules sans accents, chiffres et tirets seulement (ex. : mon-premier-article)`);
  if (!LANGS.includes(lang)) fail(`langue « ${lang} » invalide : ${LANGS.join(' ou ')}`);
  if (!date) fail(`date « ${data.date} » invalide : format AAAA-MM-JJ (ex. : 2026-10-15)`);
  if (data.mise_a_jour !== undefined && !updated) fail(`mise_a_jour « ${data.mise_a_jour} » invalide : format AAAA-MM-JJ`);
  if (date && updated && updated < date) fail('mise_a_jour est antérieure à la date de publication');
  if (!status) fail(`statut « ${text('statut')} » invalide : brouillon ou publié`);
  if (!authors[text('auteur')]) fail(`auteur « ${text('auteur')} » inconnu : ${Object.keys(authors).join(', ')} (voir src/blog-config.js)`);
  if (!categories[text('categorie')]) fail(`catégorie « ${text('categorie')} » inconnue : ${Object.keys(categories).join(', ')} (voir src/blog-config.js)`);
  if (data.traduction !== undefined && !SLUG.test(text('traduction'))) fail(`traduction « ${text('traduction')} » : indiquez le slug de l’article dans l’autre langue`);

  let image = null;
  if (data.image !== undefined) {
    image = text('image');
    if (!data.image_alt) fail('image_alt obligatoire quand une image est indiquée (description de l’image pour les personnes qui ne la voient pas)');
    if (image.startsWith('/')) {
      if (!(await exists(path.join(siteRoot, image)))) fail(`image « ${image} » introuvable (placez-la dans img/blogue/)`);
    } else if (!image.startsWith('https://')) {
      fail(`image « ${image} » : le chemin doit commencer par /img/blogue/ (ou être une adresse https://)`);
    }
  } else if (data.image_alt !== undefined) {
    fail('image_alt indiqué sans image');
  }

  if (description.length < 50 || description.length > 160) {
    warnings.push(`${where} : la description fait ${description.length} caractères ; visez 50 à 160 pour les moteurs de recherche`);
  }
  if (date && date > new Date().toISOString().slice(0, 10)) {
    warnings.push(`${where} : date de publication dans le futur (${date}) ; l’article est publié dès la mise en ligne du site`);
  }

  const bodyProblems = [];
  const localImages = [];
  const html = markdownFor(bodyProblems, localImages).parse(parsed.content);
  for (const src of localImages) {
    if (!(await exists(path.join(siteRoot, src.split(/[?#]/)[0])))) bodyProblems.push(`image « ${src} » introuvable (placez-la dans img/blogue/)`);
  }
  errors.push(...bodyProblems.map((p) => `${where} : ${p}`));
  if (errors.length) return { errors, warnings };

  const words = parsed.content.split(/\s+/).filter(Boolean).length;
  return {
    warnings,
    article: {
      file: where,
      slug,
      lang,
      title,
      description,
      date,
      updated,
      draft: status === 'brouillon',
      author: text('auteur'),
      category: text('categorie'),
      image,
      imageAlt: data.image_alt ? text('image_alt') : null,
      translationSlug: data.traduction === undefined ? null : text('traduction'),
      html,
      words,
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    },
  };
}

// Lit et valide tous les articles. Les brouillons ne sont renvoyés que si includeDrafts est vrai :
// en production, ils ne sont jamais générés. Toute erreur (y compris dans un brouillon) arrête la génération.
export async function loadArticles(dir, { includeDrafts = false, siteRoot }) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_')).sort();
  const problems = [];
  const warnings = [];
  const all = [];
  for (const file of files) {
    const result = await readArticle(file, dir, siteRoot);
    problems.push(...(result.errors || []));
    warnings.push(...(result.warnings || []));
    if (result.article) all.push(result.article);
  }

  const bySlug = new Map();
  for (const article of all) {
    const key = `${article.lang}/${article.slug}`;
    if (bySlug.has(key)) problems.push(`${article.file} : le slug « ${article.slug} » est déjà utilisé par ${bySlug.get(key).file}`);
    bySlug.set(key, article);
  }
  for (const article of all) {
    if (!article.translationSlug) continue;
    const otherLang = LANGS.find((l) => l !== article.lang);
    const other = bySlug.get(`${otherLang}/${article.translationSlug}`);
    if (!other) {
      problems.push(`${article.file} : traduction « ${article.translationSlug} » introuvable parmi les articles en « ${otherLang} »`);
    } else if (other.translationSlug && other.translationSlug !== article.slug) {
      problems.push(`${article.file} : ${other.file} indique une autre traduction (« ${other.translationSlug} »)`);
    } else {
      article.translationOf = other;
      other.translationOf ??= article;
    }
  }
  if (problems.length) throw new BlogValidationError(problems);

  const visible = all.filter((a) => includeDrafts || !a.draft);
  for (const article of visible) {
    // Lien vers la traduction seulement si elle est elle-même visible (jamais vers un brouillon en production).
    article.translation = article.translationOf && visible.includes(article.translationOf) ? article.translationOf : null;
    delete article.translationOf;
  }
  visible.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'fr'));
  return { articles: visible, warnings };
}
