# Blogue d’Artifici : guide des auteurs

Chaque article est un fichier Markdown (`.md`) dans ce dossier, `src/blogue/`. Le site le transforme en page web lors de la génération (`npm run build`).

- Articles en français : `https://artifici.ai/blogue/<slug>/`
- Articles en anglais (facultatif) : `https://artifici.ai/en/blog/<slug>/`
- Liste des articles : `/blogue/` et `/en/blog/` ; flux RSS : `/blogue/rss.xml` et `/en/blog/rss.xml`

> **Important : le dépôt GitHub est public.** Un brouillon n’est jamais publié sur le site, mais tout fichier poussé sur GitHub (y compris dans une branche ou une pull request) peut être lu par n’importe qui sur github.com. N’y mettez rien de confidentiel.

## 1. Créer un article

1. Copiez le fichier [`_modele.md`](_modele.md) et renommez la copie d’après le sujet, par exemple `argument-mining-introduction.md`. (Les fichiers qui commencent par `_` et ce `README.md` sont ignorés.)
2. Remplissez l’en-tête (entre les deux lignes `---`), puis écrivez le texte en dessous.
3. Laissez `statut: brouillon` tant que l’article n’est pas prêt.

### Exemple d’en-tête

```yaml
---
titre: "Pourquoi l’argument mining va au-delà de l’analyse de sentiment"
description: "Une objection bien argumentée peut valoir plus qu’un commentaire positif. Voici comment nous l’abordons."
date: 2026-10-15
auteur: mikael-gelinas
categorie: argument-mining
statut: brouillon
slug: argument-mining-au-dela-du-sentiment
image: /img/blogue/argument-mining-au-dela-du-sentiment/couverture.webp
image_alt: "Schéma reliant des commentaires à des arguments pour et contre"
---
```

### Les champs

| Champ | Obligatoire | Description |
| --- | --- | --- |
| `titre` | oui | Titre de l’article (idéalement moins de 70 caractères). |
| `description` | oui | Résumé d’une ou deux phrases, affiché dans la liste et dans Google (50 à 160 caractères). |
| `date` | oui | Date de publication, au format `AAAA-MM-JJ`. Les articles sont classés du plus récent au plus ancien. |
| `auteur` | oui | `francis-couture`, `mikael-gelinas`, `olivier-bloch` ou `equipe-artifici` (texte signé collectivement). |
| `categorie` | oui | `argumently`, `argument-mining`, `ia-locale` ou `decision-collaborative`. |
| `statut` | oui | `brouillon` (jamais publié) ou `publié`. |
| `slug` | oui | Fin de l’adresse de l’article : minuscules sans accents, chiffres et tirets. **Ne le changez plus une fois l’article publié** (les liens existants cesseraient de fonctionner). |
| `image` | non | Image de couverture, affichée en haut de l’article et lors des partages (LinkedIn, etc.). |
| `image_alt` | si `image` | Description de l’image pour les personnes qui ne la voient pas. |
| `mise_a_jour` | non | Date de la dernière modification importante (`AAAA-MM-JJ`). |
| `langue` | non | `fr` (par défaut) ou `en`. |
| `traduction` | non | `slug` de la version de l’article dans l’autre langue, s’il y en a une. |

Les listes d’auteurs et de catégories se trouvent dans [`src/blog-config.js`](../blog-config.js) : ajoutez-y une entrée pour en créer une nouvelle.

## 2. Écrire en Markdown

```markdown
Un paragraphe avec du **gras**, de l’*italique* et [un lien](https://exemple.com).

## Intertitre de section

### Sous-intertitre

- Élément de liste
- Autre élément

1. Étape numérotée
2. Étape suivante

> Une citation.

![Description de l’image](/img/blogue/mon-slug/schema.webp "Légende facultative")
```

- **N’utilisez pas `#` seul** : le titre de l’article vient de l’en-tête. Commencez les intertitres par `##`.
- Les blocs de code s’écrivent entre trois accents graves (```` ``` ````), et les tableaux avec des `|`.
- Voir [`exemple-brouillon.md`](exemple-brouillon.md) pour toutes les mises en forme possibles.

### Images

- Placez les images dans `img/blogue/<slug>/` (à la racine du dépôt) et citez-les avec un chemin qui commence par `/img/blogue/`.
- Formats conseillés : `.webp` ou `.jpg`, 1600 px de large au maximum. Pour la couverture, le format 1200 × 630 est idéal pour les partages.
- Chaque image doit avoir une description (`![description](...)`) : la génération s’arrête sinon.

## 3. Prévisualiser

Il faut [Node.js](https://nodejs.org/) (version 20 ou plus récente). Une seule fois : `npm install`.

```bash
npm run apercu
```

Ouvrez ensuite <http://localhost:8080/blogue/>. L’aperçu affiche aussi les brouillons (avec un bandeau « Brouillon ») et se met à jour à chaque enregistrement. Il est généré dans `_apercu/`, un dossier ignoré par Git et jamais publié.

## 4. Proposer, réviser et publier (pull request)

Le site est publié automatiquement à partir de la branche `main`. Tout article passe donc par une **pull request (PR)** relue par au moins une autre personne.

### Sans rien installer (directement sur GitHub)

1. Sur GitHub, ouvrez le dossier `src/blogue/`, puis **Add file → Create new file**.
2. Nommez le fichier (ex. : `mon-article.md`), collez le contenu de `_modele.md` et rédigez.
3. En bas de la page, choisissez **Create a new branch** et validez : GitHub propose d’ouvrir une pull request.
4. Pour ajouter des images : dans la même branche, ouvrez `img/blogue/`, puis **Add file → Upload files**.

À chaque modification de la PR, une vérification automatique valide l’article (champs, images, mise en forme) et ajoute les pages générées à la PR. Si elle échoue, le message d’erreur indique le fichier et le champ à corriger.

### En local

```bash
git switch -c article/mon-article
# rédiger src/blogue/mon-article.md, puis :
npm run apercu        # relire le rendu
git add src/blogue img/blogue
git commit -m "Article : mon article"
git push -u origin article/mon-article
```

Ouvrez ensuite la pull request sur GitHub.

### Relecture

- Relisez le texte dans l’onglet **Files changed** de la PR ; commentez directement les lignes.
- Pour voir le rendu final : récupérez la branche et lancez `npm run apercu`.
- Vérifiez la liste de contrôle de la PR (faits vérifiés, sources, images décrites, etc.).

### Publier

1. Dans l’en-tête de l’article, remplacez `statut: brouillon` par `statut: publié` et vérifiez la `date`.
2. Attendez que la vérification automatique de la PR soit verte.
3. Fusionnez la PR (**Merge**). Le site est en ligne quelques minutes plus tard.

Pour dépublier un article, repassez-le en `brouillon` (ou supprimez le fichier) dans une nouvelle PR : sa page disparaît du site à la génération suivante.

## 5. Traductions (facultatif)

Le français est la langue principale : un article n’a pas besoin d’être traduit. Un article sans traduction apparaît aussi dans la liste anglaise, avec la mention « In French ».

Pour publier une version anglaise, créez un second fichier avec `langue: en`, son propre `slug` en anglais et `traduction:` suivi du slug de l’article français. Les deux versions sont alors reliées (lien « Read this article in English » et bascule FR/EN).

## 6. Messages d’erreur fréquents

| Message | Solution |
| --- | --- |
| `champ « titre » obligatoire` | Un champ obligatoire manque ou est vide dans l’en-tête. |
| `statut « … » invalide` | Écrivez `brouillon` ou `publié`. |
| `date « … » invalide` | Format `AAAA-MM-JJ`, par exemple `2026-10-15`. |
| `auteur « … » inconnu` / `catégorie « … » inconnue` | Utilisez un identifiant de la liste ci-dessus (ou ajoutez-le dans `src/blog-config.js`). |
| `titre « # … » dans le texte` | Remplacez `#` par `##`. |
| `image … sans texte de remplacement` | Écrivez une description entre les crochets : `![description](...)`. |
| `image … introuvable` | Vérifiez le chemin et que l’image est bien dans `img/blogue/`. |
| `en-tête illisible` | Vérifiez les deux lignes `---` et mettez le texte entre guillemets s’il contient `:`. |

## Pour l’équipe technique

- `npm test` vérifie le blogue : brouillons absents de la production, ordre de la liste, métadonnées, RSS, plan du site et messages de validation.
- Code : `scripts/lib/blog.js` (lecture et validation), `scripts/lib/site.js` (génération), gabarits dans `src/pages/blog-*.html` et `src/partials/`.
- Les dossiers `blogue/` et `en/blog/` à la racine sont entièrement régénérés : ne les modifiez pas à la main.
