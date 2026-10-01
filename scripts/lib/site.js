// Génération du site : pages fixes (fr/en), blogue, flux RSS et plan du site.

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authors, categories } from '../../src/blog-config.js';
import content from '../../src/content.js';
import { LANGS, articlePath, blogPaths, loadArticles } from './blog.js';
import { escapeHtml, render } from './template.js';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SITE = 'https://artifici.ai';

const locales = { fr: 'fr-CA', en: 'en-CA' };
const otherLang = (lang) => LANGS.find((l) => l !== lang);
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

const home = { urls: { fr: '/', en: '/en/' } };
const privacy = { urls: { fr: '/confidentialite/', en: '/en/privacy/' } };
// Pages fixes : gabarit (commun ou par langue), titre et URL dans chaque langue.
const staticPages = [
  {
    ...home,
    body: { fr: 'src/pages/home.html', en: 'src/pages/home.html' },
    title: 'metaTitle',
    description: 'metaDescription',
  },
  {
    ...privacy,
    body: { fr: 'src/pages/privacy.fr.html', en: 'src/pages/privacy.en.html' },
    title: 'privacyMetaTitle',
    description: 'privacyMetaDescription',
    breadcrumb: 'footerPrivacy',
  },
];

const templateFiles = {
  layout: 'src/layout.html',
  blogIndex: 'src/pages/blog-index.html',
  article: 'src/pages/blog-article.html',
  card: 'src/partials/article-card.html',
  empty: 'src/partials/blog-empty.html',
  draftBanner: 'src/partials/draft-banner.html',
};

const founders = [
  { name: 'Francis Couture', role: 'role1' },
  { name: 'Mikaël Gélinas', role: 'role2' },
  { name: 'Olivier Bloch', role: 'role3' },
];

const formatDate = (iso, lang) => {
  const label = new Intl.DateTimeFormat(locales[lang], { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
  // En français, le premier jour du mois s’écrit « 1er ».
  return lang === 'fr' ? label.replace(/^1 /, '1er ') : label;
};
const authorName = (article, lang) => {
  const { name } = authors[article.author];
  return typeof name === 'string' ? name : name[lang];
};
const absolute = (url) => (url.startsWith('https://') ? url : SITE + url);

function checkSameKeys() {
  const [first, ...others] = Object.keys(content);
  const reference = new Set(Object.keys(content[first]));
  for (const lang of others) {
    const keys = new Set(Object.keys(content[lang]));
    const missing = [...reference].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !reference.has(k));
    if (missing.length || extra.length) {
      throw new Error(`Clés différentes entre "${first}" et "${lang}" — manquantes : ${missing.join(', ') || 'aucune'} ; en trop : ${extra.join(', ') || 'aucune'}`);
    }
  }
}

// Données structurées schema.org (JSON-LD) : organisation, site, page courante, fil d’Ariane et nœuds propres à la page.
function structuredData({ lang, url, title, description, isHome = false, breadcrumb = [], extra = [] }) {
  const t = content[lang];
  const pageUrl = SITE + url;
  const webPage = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: locales[lang],
    isPartOf: { '@id': SITE_ID },
  };
  const graph = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Artifici',
      alternateName: 'Artifici.ai',
      legalName: 'Les Services en ligne Artifici inc.',
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: `${SITE}/android-chrome-512x512.png`, width: 512, height: 512 },
      description: t.orgDescription,
      foundingDate: '2017',
      address: { '@type': 'PostalAddress', addressLocality: 'Québec', addressRegion: 'QC', addressCountry: 'CA' },
      founder: founders.map((f) => ({ '@type': 'Person', name: f.name, jobTitle: t[f.role] })),
      knowsAbout: t.knowsAbout,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: t.servicesTitle,
        itemListElement: [1, 2, 3, 4].map((n) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: t[`service${n}`], description: t[`service${n}d`], provider: { '@id': ORG_ID } },
        })),
      },
      sameAs: [t.linkedinUrl, 'https://twitter.com/ArtificiAI', t.githubUrl],
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: `${SITE}/`,
      name: 'Artifici',
      inLanguage: Object.values(locales),
      publisher: { '@id': ORG_ID },
    },
    webPage,
  ];
  if (isHome) webPage.about = { '@id': ORG_ID };
  if (breadcrumb.length) {
    webPage.breadcrumb = { '@id': `${pageUrl}#breadcrumb` };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [{ name: 'Artifici', url: home.urls[lang] }, ...breadcrumb].map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: SITE + item.url,
      })),
    });
  }
  graph.push(...extra);
  // « < » échappé pour qu’aucun texte ne puisse fermer la balise <script>.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
}

// Variables communes au gabarit src/layout.html.
function layoutVars(page) {
  const t = content[page.lang];
  const pageUrl = SITE + page.url;
  const alternates = page.counterpart
    ? [
        ...LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${SITE + page.counterpart[l]}">`),
        `  <link rel="alternate" hreflang="x-default" href="${SITE + page.counterpart.fr}">`,
        `  <meta property="og:locale:alternate" content="${content[otherLang(page.lang)].ogLocale}">`,
      ]
    : [];
  const image = page.image
    ? [
        `  <meta property="og:image" content="${escapeHtml(absolute(page.image.url))}">`,
        `  <meta property="og:image:alt" content="${escapeHtml(page.image.alt)}">`,
        `  <meta name="twitter:image" content="${escapeHtml(absolute(page.image.url))}">`,
      ]
    : [
        `  <meta property="og:image" content="${t.ogImage}">`,
        '  <meta property="og:image:width" content="1200">',
        '  <meta property="og:image:height" content="630">',
        `  <meta property="og:image:alt" content="${escapeHtml(t.ogImageAlt)}">`,
        `  <meta name="twitter:image" content="${t.ogImage}">`,
      ];
  const extraHead = [...(page.articleMeta || []), ...(page.noindex ? ['  <meta name="robots" content="noindex">'] : [])];

  return {
    lang: page.lang,
    pageTitle: page.title,
    pageDescription: page.description,
    pageUrl,
    ogType: page.ogType || 'website',
    alternateLinks: alternates.join('\n'),
    ogImageTags: image.join('\n'),
    extraHead: extraHead.join('\n'),
    frUrl: page.switchUrls.fr,
    enUrl: page.switchUrls.en,
    frCurrent: page.lang === 'fr' ? 'page' : 'false',
    enCurrent: page.lang === 'en' ? 'page' : 'false',
    // Redirection vers l’anglais (choix mémorisé) seulement si cette page a un vrai équivalent anglais.
    enCounterpart: page.lang === 'fr' && page.counterpart ? page.counterpart.en : '',
    homeUrl: home.urls[page.lang],
    privacyUrl: privacy.urls[page.lang],
    blogUrl: blogPaths[page.lang],
    rssUrl: `${blogPaths[page.lang]}rss.xml`,
    // Ancres des sections de l’accueil : relatives sur l’accueil, absolues ailleurs.
    navBase: page.url === home.urls[page.lang] ? '' : home.urls[page.lang],
    blogCurrent: page.blog ? 'page' : 'false',
    jsonLd: page.jsonLd,
  };
}

// Mots-clés du haut de l’accueil : le « · » reste collé au terme qui le précède,
// pour qu’un séparateur ne commence jamais une ligne.
function heroTags(tags) {
  return tags
    .map((tag, i) => {
      const separator = i < tags.length - 1 ? '<span aria-hidden="true">·</span>' : '';
      return `            <li class="inline-flex items-center gap-2">${escapeHtml(tag)}${separator}</li>`;
    })
    .join('\n');
}

// Articles affichés dans une langue : ceux de cette langue, plus ceux de l’autre langue qui n’y sont pas traduits.
const listedIn = (articles, lang) => articles.filter((a) => a.lang === lang || !a.translation);

function sitemap(entries) {
  const lines = entries.flatMap(({ url, counterpart, lastmod }) => [
    '  <url>',
    `    <loc>${SITE + url}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...(counterpart
      ? [...LANGS, 'x-default'].map((l) => {
          const href = SITE + counterpart[l === 'x-default' ? 'fr' : l];
          return `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`;
        })
      : []),
    '  </url>',
  ]);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...lines,
    '</urlset>',
    '',
  ].join('\n');
}

function rssFeed(lang, items) {
  const t = content[lang];
  const xml = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
  // Midi UTC : la date affichée par les lecteurs RSS reste la même quel que soit le fuseau horaire.
  const rfc822 = (iso) => new Date(`${iso}T12:00:00Z`).toUTCString();
  const blogUrl = SITE + blogPaths[lang];
  const latest = items.map((a) => a.updated || a.date).sort().at(-1);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${xml(t.rssTitle)}</title>`,
    `    <link>${blogUrl}</link>`,
    `    <atom:link href="${blogUrl}rss.xml" rel="self" type="application/rss+xml"/>`,
    `    <description>${xml(t.blogMetaDescription)}</description>`,
    `    <language>${locales[lang]}</language>`,
    ...(latest ? [`    <lastBuildDate>${rfc822(latest)}</lastBuildDate>`] : []),
    ...items.flatMap((a) => [
      '    <item>',
      `      <title>${xml(a.title)}</title>`,
      `      <link>${SITE + articlePath(a)}</link>`,
      `      <guid isPermaLink="true">${SITE + articlePath(a)}</guid>`,
      `      <pubDate>${rfc822(a.date)}</pubDate>`,
      `      <dc:creator>${xml(authorName(a, a.lang))}</dc:creator>`,
      `      <category>${xml(categories[a.category][a.lang])}</category>`,
      `      <description>${xml(a.description)}</description>`,
      '    </item>',
    ]),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

// Génère le site dans outDir. En production (includeDrafts faux), aucun brouillon n’est généré.
export async function buildSite({
  outDir = root,
  articlesDir = path.join(root, 'src/blogue'),
  includeDrafts = false,
  log = () => {},
} = {}) {
  checkSameKeys();
  const { articles, warnings } = await loadArticles(articlesDir, { includeDrafts, siteRoot: root });
  for (const warning of warnings) log(`⚠ ${warning}`);

  const tpl = {};
  for (const [name, file] of Object.entries(templateFiles)) {
    tpl[name] = { source: file, text: await readFile(path.join(root, file), 'utf8') };
  }
  const css = await readFile(path.join(root, 'assets/site.css'));
  const shared = { cssVersion: createHash('sha256').update(css).digest('hex').slice(0, 10), year: new Date().getFullYear() };

  // Les dossiers du blogue sont entièrement générés : on les vide pour qu’aucun article retiré
  // ou repassé en brouillon ne reste en ligne.
  for (const dir of Object.values(blogPaths)) await rm(path.join(outDir, dir), { recursive: true, force: true });

  const written = [];
  const sitemapEntries = [];
  const emit = async (page) => {
    const vars = { ...content[page.lang], ...shared, ...layoutVars(page) };
    const bodyTemplate = typeof page.body === 'string' ? tpl[page.body] : page.body;
    const main = render(bodyTemplate.text, { ...vars, ...page.bodyVars }, bodyTemplate.source);
    const html = render(tpl.layout.text, { ...vars, main }, tpl.layout.source);
    const file = path.join(outDir, page.url, 'index.html');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
    written.push(page.url);
    if (!page.noindex) sitemapEntries.push({ url: page.url, counterpart: page.counterpart, lastmod: page.lastmod });
    log(`✓ ${path.relative(outDir, file).replaceAll('\\', '/')}`);
  };

  for (const page of staticPages) {
    for (const lang of LANGS) {
      const t = content[lang];
      const url = page.urls[lang];
      await emit({
        lang,
        url,
        title: t[page.title],
        description: t[page.description],
        counterpart: page.urls,
        switchUrls: page.urls,
        body: { source: page.body[lang], text: await readFile(path.join(root, page.body[lang]), 'utf8') },
        bodyVars: { heroTags: heroTags(t.heroTags) },
        jsonLd: structuredData({
          lang,
          url,
          title: t[page.title],
          description: t[page.description],
          isHome: page === staticPages[0],
          breadcrumb: page.breadcrumb ? [{ name: t[page.breadcrumb], url }] : [],
        }),
      });
    }
  }

  for (const lang of LANGS) {
    const t = content[lang];
    const url = blogPaths[lang];
    const items = listedIn(articles, lang);
    const cards = items.map((a) => {
      const foreign = a.lang !== lang;
      return render(tpl.card.text, {
        cardUrl: articlePath(a),
        cardTitle: a.title,
        cardDescription: a.description,
        cardCategory: categories[a.category][lang],
        cardDate: a.date,
        cardDateLabel: formatDate(a.date, lang),
        cardAuthor: authorName(a, lang),
        cardLangAttr: foreign ? ` lang="${a.lang}"` : '',
        cardBadges: [
          foreign ? `<span class="rounded-full px-3 py-1 font-medium text-primary-700 ring-1 ring-primary-200 dark:text-primary-100 dark:ring-primary-600">${escapeHtml(t.blogOtherLanguage)}</span>` : '',
          a.draft ? `<span class="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">${escapeHtml(t.blogDraftBadge)}</span>` : '',
        ].join(''),
        cardImage: a.image
          ? `<img src="${escapeHtml(a.image)}" alt="" loading="lazy" decoding="async" class="mb-6 aspect-[1200/630] w-full rounded-xl object-cover ring-1 ring-primary-100 dark:ring-primary-700">`
          : '',
      }, tpl.card.source);
    });
    await emit({
      lang,
      url,
      title: t.blogMetaTitle,
      description: t.blogMetaDescription,
      counterpart: blogPaths,
      switchUrls: blogPaths,
      blog: true,
      body: 'blogIndex',
      bodyVars: {
        articleList: items.length
          ? `<ul class="divide-y divide-primary-100 dark:divide-primary-800">\n${cards.join('')}</ul>`
          : render(tpl.empty.text, t, tpl.empty.source),
      },
      jsonLd: structuredData({
        lang,
        url,
        title: t.blogMetaTitle,
        description: t.blogMetaDescription,
        breadcrumb: [{ name: t.blogTitle, url }],
        extra: [
          {
            '@type': 'Blog',
            '@id': `${SITE + url}#blog`,
            url: SITE + url,
            name: t.rssTitle,
            description: t.blogMetaDescription,
            inLanguage: locales[lang],
            publisher: { '@id': ORG_ID },
            blogPost: items
              .filter((a) => !a.draft)
              .map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: SITE + articlePath(a), datePublished: a.date, inLanguage: locales[a.lang] })),
          },
        ],
      }),
    });
    await mkdir(path.join(outDir, url), { recursive: true });
    await writeFile(path.join(outDir, url, 'rss.xml'), rssFeed(lang, items.filter((a) => !a.draft)));
    log(`✓ ${url.slice(1)}rss.xml`);
  }

  for (const a of articles) {
    const t = content[a.lang];
    const other = otherLang(a.lang);
    const url = articlePath(a);
    const translationUrl = a.translation ? articlePath(a.translation) : null;
    const author = authors[a.author];
    const categoryLabel = categories[a.category][a.lang];
    await emit({
      lang: a.lang,
      url,
      title: `${a.title} | ${t.rssTitle}`,
      description: a.description,
      counterpart: translationUrl ? { [a.lang]: url, [other]: translationUrl } : null,
      switchUrls: { [a.lang]: url, [other]: translationUrl || blogPaths[other] },
      ogType: 'article',
      image: a.image ? { url: a.image, alt: a.imageAlt } : null,
      articleMeta: [
        `  <meta property="article:published_time" content="${a.date}">`,
        ...(a.updated ? [`  <meta property="article:modified_time" content="${a.updated}">`] : []),
        `  <meta property="article:section" content="${escapeHtml(categoryLabel)}">`,
      ],
      noindex: a.draft,
      lastmod: a.updated || a.date,
      blog: true,
      body: 'article',
      bodyVars: {
        draftBanner: a.draft ? render(tpl.draftBanner.text, t, tpl.draftBanner.source) : '',
        articleTitle: a.title,
        articleDescription: a.description,
        articleCategory: categoryLabel,
        articleAuthor: authorName(a, a.lang),
        articleDate: a.date,
        articleDateLabel: formatDate(a.date, a.lang),
        articleUpdated: a.updated
          ? `<span aria-hidden="true">·</span><span>${escapeHtml(t.blogUpdated)} <time datetime="${a.updated}">${formatDate(a.updated, a.lang)}</time></span>`
          : '',
        articleReadingTime: `${a.readingMinutes} ${t.blogReadingTime}`,
        articleTranslationLink: translationUrl
          ? `<p class="mt-5 text-sm"><a href="${translationUrl}" lang="${other}" hreflang="${other}" class="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-500 dark:text-primary-200 dark:hover:text-white">${escapeHtml(content[other].readInThisLanguage)}</a></p>`
          : '',
        articleCover: a.image
          ? `<div class="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8"><img src="${escapeHtml(a.image)}" alt="${escapeHtml(a.imageAlt)}" decoding="async" class="w-full rounded-2xl ring-1 ring-primary-100 dark:ring-primary-700"></div>`
          : '',
        articleHtml: a.html,
      },
      jsonLd: structuredData({
        lang: a.lang,
        url,
        title: a.title,
        description: a.description,
        breadcrumb: [
          { name: t.blogTitle, url: blogPaths[a.lang] },
          { name: a.title, url },
        ],
        extra: [
          {
            '@type': 'BlogPosting',
            '@id': `${SITE + url}#article`,
            headline: a.title,
            description: a.description,
            url: SITE + url,
            datePublished: a.date,
            dateModified: a.updated || a.date,
            inLanguage: locales[a.lang],
            articleSection: categoryLabel,
            wordCount: a.words,
            author: author.organization
              ? { '@id': ORG_ID }
              : { '@type': 'Person', name: author.name, jobTitle: author.role[a.lang], worksFor: { '@id': ORG_ID } },
            publisher: { '@id': ORG_ID },
            mainEntityOfPage: { '@id': `${SITE + url}#webpage` },
            isPartOf: { '@id': `${SITE + blogPaths[a.lang]}#blog` },
            ...(a.image ? { image: absolute(a.image) } : {}),
          },
        ],
      }),
    });
  }

  await writeFile(path.join(outDir, 'sitemap.xml'), sitemap(sitemapEntries));
  log('✓ sitemap.xml');
  return { articles, pages: written };
}
