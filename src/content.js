// Textes du site, par langue. scripts/build.js génère index.html (fr) et en/index.html (en)
// à partir de src/index.html. Chaque clé doit exister dans les deux langues.
// Les clés se terminant par « Html » sont insérées telles quelles (balisage permis).

const FORM_URL =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=WnCDb8h7N0iDQf3lxLt-ZJmnwjJlQ-FKgwnmMO-pVm9UREtBUklOVjJONjFDWlQxVjNURUZFWDVPTS4u';

// Landing page Argumently hébergée sur HubSpot (français seulement)
const ARGUMENTLY_URL = 'https://342965519.hs-sites-na3.com/fr-ca/argumently';

const shared = {
  formUrl: FORM_URL,
  argumentlyUrl: ARGUMENTLY_URL,
  linkedinUrl: 'https://www.linkedin.com/company/artifici',
  githubUrl: 'https://github.com/ArtificiAI',
};

export default {
  fr: {
    ...shared,
    metaTitle: 'Artifici | Intelligence artificielle, NLP et aide à la décision',
    metaDescription:
      'Artifici aide les organisations à transformer leurs conversations numériques et données textuelles en enseignements exploitables pour mieux décider.',
    ogLocale: 'fr_CA',
    ogImage: 'https://artifici.ai/img/og-cover.jpg',
    ogImageAlt: 'Artifici — Transformez vos conversations numériques en décisions éclairées.',
    // Données structurées (schema.org) : description de l’organisation et domaines d’expertise.
    orgDescription:
      'Entreprise québécoise spécialisée en intelligence artificielle appliquée et en traitement du langage naturel : plateforme collaborative d’aide à la décision et services-conseil en IA.',
    knowsAbout: [
      'Intelligence artificielle appliquée',
      'Traitement du langage naturel',
      'Argument mining',
      'Argument mapping',
      'Aide à la décision collaborative',
      'Intelligence collective',
    ],

    skipLink: 'Aller au contenu',
    homeLabel: 'Artifici — accueil',
    mainNavLabel: 'Navigation principale',
    langNavLabel: 'Langue',
    themeLabel: 'Thème sombre',
    menuLabel: 'Menu',
    newTab: '(s’ouvre dans un nouvel onglet)',

    navCompany: 'L’entreprise',
    navProduct: 'Produit',
    navServices: 'Services',
    navTeam: 'L’équipe',
    navContact: 'Contact',

    // Mots-clés au-dessus du titre (termes anglais conservés : ce sont ceux reconnus dans le domaine).
    heroTags: ['IA appliquée', 'NLP', 'Argument mining', 'Argument mapping', 'Aide à la décision'],
    heroTitleHtml:
      'Transformez vos <span class="text-accent">conversations numériques</span> en décisions <span class="underline decoration-amber-500 decoration-4 underline-offset-8">éclairées</span>.',
    heroSubtitle:
      'Artifici aide les organisations à analyser leurs commentaires, leurs échanges et leurs données textuelles pour faire émerger les signaux utiles à la décision.',
    heroCtaPrimary: 'Découvrir la plateforme',
    heroCtaSecondary: 'Discuter de votre projet',

    companyTitle: 'L’entreprise',
    companyBody:
      'Artifici est spécialisée en intelligence artificielle appliquée et en traitement du langage naturel. Nous aidons les organisations à comprendre ce qui se dit dans leurs espaces numériques afin d’éclairer leurs stratégies, leurs services et leurs décisions.',
    whyTitle: 'Pourquoi Artifici\u00a0?',
    why1: 'Compréhension fine des conversations',
    why1d: 'Analyse sémantique et contextuelle pour révéler les signaux faibles.',
    why2: 'Décisions mieux informées',
    why2d: 'Tableaux clairs et priorisation des options selon les faits observés.',
    why3: 'Déploiement adapté aux réalités organisationnelles',
    why3d: 'Méthodes pragmatiques alignées sur vos processus, vos équipes et vos contraintes.',

    productTitle: 'Notre plateforme',
    productStatus: 'En développement actif',
    productBody:
      'Une plateforme collaborative d’aide à la décision conçue pour valoriser l’intelligence collective, structurer les options, suivre les objections et conserver l’historique des décisions.',
    benefit1: 'Performance décisionnelle accrue',
    benefit1a: 'Amélioration de la qualité et de l’efficience décisionnelle',
    benefit1b: 'Réduction du temps en réunion',
    benefit1c: 'Suivi des décisions en continu',
    benefit2: 'Intelligence collective valorisée',
    benefit2a: 'Mettre en valeur l’intelligence collaborative de vos équipes',
    benefit2b: 'Rapprochement des paliers de décision',
    benefit2c: 'Transparence du processus décisionnel',
    benefit3: 'Décisions traçables et historiques',
    benefit3a: 'Traçabilité des décisions',
    benefit3b: 'Historisation des décisions',
    productCta: 'Découvrir Argumently',

    servicesTitle: 'Services-conseil en IA et NLP',
    servicesBody:
      'De l’audit au déploiement, nous accompagnons vos équipes pour transformer commentaires, conversations et données textuelles en enseignements exploitables.',
    service1: 'Audit et diagnostic',
    service1d: 'Évaluation de vos données, de vos usages et des opportunités prioritaires.',
    service2: 'Prototypes rapides',
    service2d: 'Validation rapide de cas d’usage à fort impact métier.',
    service3: 'Fine-tuning et MLOps',
    service3d: 'Adaptation de modèles, industrialisation et déploiement sécurisé.',
    service4: 'Formation et transfert',
    service4d: 'Montée en compétence de vos équipes techniques et métiers.',
    servicesCta: 'Discuter de votre projet',

    teamTitle: 'L’équipe',
    teamBody:
      'Trois cofondateurs passionnés par l’intelligence artificielle, les données et l’entrepreneuriat portent la vision d’Artifici\u00a0: mettre au premier plan ce que les gens ont en commun.',
    role1: 'Cofondateur, PDG',
    role2: 'Cofondateur, Scientifique de données',
    role3: 'Cofondateur, Scientifique de données',
    teamMultiTitle: 'Notre équipe multidisciplinaire',
    teamMultiBody:
      'Ingénieurs logiciel, scientifiques des données, spécialistes UX, créatifs marketing et experts cloud travaillent main dans la main pour transformer vos données en enseignements exploitables.',
    teamMultiCta: 'Envoyez votre candidature spontanée',

    contactTitle: 'Nous contacter',
    contactBody:
      'Une question, une demande ou un projet à nous confier\u00a0? Communiquez avec nous pour discuter de vos besoins.',
    contactCta: 'Remplir le formulaire',
    contactLinkedin: 'Suivez-nous sur LinkedIn',
    contactPrivacyNote: 'Vos renseignements sont traités conformément à notre',
    contactPrivacyLink: 'politique de confidentialité',

    footerTagline: 'Intelligence artificielle appliquée et aide à la décision collaborative.',
    footerLocation: 'Québec, Canada',
    footerNavTitle: 'Navigation',
    footerFollowTitle: 'Suivre Artifici',
    footerCookies: 'Gérer les cookies',
    footerPrivacy: 'Politique de confidentialité',
    footerRights: 'Tous droits réservés.',

    privacyMetaTitle: 'Politique de confidentialité | Artifici',
    privacyMetaDescription:
      'Comment Artifici recueille, utilise et protège vos renseignements personnels, et comment exercer vos droits.',
    backHome: 'Retour à l’accueil',

    // Blogue
    navBlog: 'Blogue',
    blogTitle: 'Blogue',
    blogMetaTitle: 'Blogue | Artifici',
    blogMetaDescription:
      'Nos travaux sur Argumently, l’argument mining, l’IA locale et la prise de décision collaborative.',
    blogIntro: 'Nos travaux sur Argumently, l’argument mining, l’IA locale et la prise de décision collaborative.',
    blogRssLink: 'S’abonner au flux RSS',
    rssTitle: 'Blogue Artifici',
    blogEmpty: 'Aucun article publié pour le moment. Revenez bientôt\u00a0!',
    blogBack: 'Tous les articles',
    blogReadingTime: 'min de lecture',
    blogUpdated: 'Mis à jour le',
    blogOtherLanguage: 'En anglais',
    readInThisLanguage: 'Lire cet article en français',
    blogDraftBadge: 'Brouillon',
    blogDraftBanner:
      'Brouillon\u00a0: cette page n’existe que dans l’aperçu local. Elle ne sera pas publiée tant que son statut n’est pas «\u00a0publié\u00a0».',
  },

  en: {
    ...shared,
    metaTitle: 'Artifici | AI, NLP and collaborative decision support',
    metaDescription:
      'Artifici helps organizations turn digital conversations and textual data into actionable insights for better decision-making.',
    ogLocale: 'en_CA',
    ogImage: 'https://artifici.ai/img/og-cover-en.jpg',
    ogImageAlt: 'Artifici — Turn digital conversations into better decisions.',
    orgDescription:
      'Québec-based company specializing in applied artificial intelligence and natural language processing: a collaborative decision-support platform and AI consulting services.',
    knowsAbout: [
      'Applied artificial intelligence',
      'Natural language processing',
      'Argument mining',
      'Argument mapping',
      'Collaborative decision support',
      'Collective intelligence',
    ],

    skipLink: 'Skip to content',
    homeLabel: 'Artifici — home',
    mainNavLabel: 'Main navigation',
    langNavLabel: 'Language',
    themeLabel: 'Dark theme',
    menuLabel: 'Menu',
    newTab: '(opens in a new tab)',

    navCompany: 'Company',
    navProduct: 'Product',
    navServices: 'Services',
    navTeam: 'Team',
    navContact: 'Contact',

    heroTags: ['Applied AI', 'NLP', 'Argument mining', 'Argument mapping', 'Decision support'],
    heroTitleHtml:
      'Turn <span class="text-accent">digital conversations</span> into <span class="underline decoration-amber-500 decoration-4 underline-offset-8">better decisions</span>.',
    heroSubtitle:
      'Artifici helps organizations analyze comments, discussions and textual data to surface the signals that matter for decision-making.',
    heroCtaPrimary: 'Discover the platform',
    heroCtaSecondary: 'Discuss your project',

    companyTitle: 'Company',
    companyBody:
      'Artifici specializes in applied artificial intelligence and natural language processing. We help organizations understand what is being said across their digital spaces in order to inform strategy, services and decisions.',
    whyTitle: 'Why Artifici?',
    why1: 'Deep understanding of conversations',
    why1d: 'Semantic and contextual analysis to surface weak but meaningful signals.',
    why2: 'Better-informed decisions',
    why2d: 'Clear dashboards and option prioritization based on observed evidence.',
    why3: 'Deployment aligned with organizational realities',
    why3d: 'Pragmatic methods aligned with your processes, teams and constraints.',

    productTitle: 'Our platform',
    productStatus: 'In active development',
    productBody:
      'A collaborative decision-support platform designed to leverage collective intelligence, structure options, track objections and preserve decision history.',
    benefit1: 'Improved decision performance',
    benefit1a: 'Higher decision quality and efficiency',
    benefit1b: 'Reduced meeting time',
    benefit1c: 'Continuous decision follow-up',
    benefit2: 'Collective intelligence made visible',
    benefit2a: 'Highlight your teams’ collaborative intelligence',
    benefit2b: 'Closer alignment across decision levels',
    benefit2c: 'Transparent decision process',
    benefit3: 'Traceable and documented decisions',
    benefit3a: 'Decision traceability',
    benefit3b: 'Decision history preserved',
    productCta: 'Discover Argumently',

    servicesTitle: 'AI and NLP consulting',
    servicesBody:
      'From audit to deployment, we help teams transform comments, discussions and textual data into actionable insights.',
    service1: 'Audit and diagnosis',
    service1d: 'Assessment of your data, workflows and high-priority opportunities.',
    service2: 'Rapid prototypes',
    service2d: 'Fast validation of high-impact business use cases.',
    service3: 'Fine-tuning and MLOps',
    service3d: 'Model adaptation, industrialization and secure deployment.',
    service4: 'Training and knowledge transfer',
    service4d: 'Practical enablement for technical and business teams.',
    servicesCta: 'Discuss your project',

    teamTitle: 'Team',
    teamBody:
      'Three co-founders passionate about artificial intelligence, data and entrepreneurship lead Artifici’s vision: bringing forward what people have in common.',
    role1: 'Co-founder, CEO',
    role2: 'Co-founder, Data Scientist',
    role3: 'Co-founder, Data Scientist',
    teamMultiTitle: 'Our multidisciplinary team',
    teamMultiBody:
      'Software engineers, data scientists, UX specialists, marketing creatives and cloud experts work hand in hand to turn your data into actionable insights.',
    teamMultiCta: 'Send your spontaneous application',

    contactTitle: 'Contact us',
    contactBody:
      'Have a question, a request or a project to discuss? Contact us to explore how we can help.',
    contactCta: 'Fill out the form',
    contactLinkedin: 'Follow us on LinkedIn',
    contactPrivacyNote: 'Your information is handled in accordance with our',
    contactPrivacyLink: 'privacy policy',

    footerTagline: 'Applied artificial intelligence and collaborative decision support.',
    footerLocation: 'Québec, Canada',
    footerNavTitle: 'Navigation',
    footerFollowTitle: 'Follow Artifici',
    footerCookies: 'Manage cookies',
    footerPrivacy: 'Privacy policy',
    footerRights: 'All rights reserved.',

    privacyMetaTitle: 'Privacy policy | Artifici',
    privacyMetaDescription:
      'How Artifici collects, uses and protects your personal information, and how to exercise your rights.',
    backHome: 'Back to home',

    // Blog
    navBlog: 'Blog',
    blogTitle: 'Blog',
    blogMetaTitle: 'Blog | Artifici',
    blogMetaDescription:
      'Our work on Argumently, argument mining, local AI and collaborative decision-making.',
    blogIntro:
      'Our work on Argumently, argument mining, local AI and collaborative decision-making. Most articles are published in French.',
    blogRssLink: 'Subscribe to the RSS feed',
    rssTitle: 'Artifici blog',
    blogEmpty: 'No articles published yet. Check back soon!',
    blogBack: 'All articles',
    blogReadingTime: 'min read',
    blogUpdated: 'Updated',
    blogOtherLanguage: 'In French',
    readInThisLanguage: 'Read this article in English',
    blogDraftBadge: 'Draft',
    blogDraftBanner: 'Draft: this page only exists in the local preview. It will not be published until its status is “publié”.',
  },
};
