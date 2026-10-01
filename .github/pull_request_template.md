## Résumé

<!-- En une ou deux phrases : quel article ou quelle modification ? -->

## S’il s’agit d’un article du blogue

Guide : [`src/blogue/README.md`](../blob/main/src/blogue/README.md)

- [ ] L’en-tête est complet (titre, description, date, auteur, catégorie, statut, slug).
- [ ] Les faits, chiffres et citations sont vérifiés et leurs sources sont indiquées.
- [ ] Rien de confidentiel : le dépôt est public, même pour les brouillons.
- [ ] Chaque image a une description (texte de remplacement) et se trouve dans `img/blogue/<slug>/`.
- [ ] Le texte a été relu (orthographe, liens) dans l’aperçu (`npm run apercu`) ou par une autre personne.
- [ ] Pour publier : `statut: publié` et `date` à jour. Pour garder en brouillon : `statut: brouillon`.

La vérification automatique valide l’article et ajoute les pages générées à cette pull request.
