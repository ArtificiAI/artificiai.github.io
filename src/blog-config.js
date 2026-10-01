// Auteurs et catégories autorisés dans l’en-tête des articles du blogue (champs « auteur » et « categorie »).
// Pour ajouter une personne ou une catégorie, ajoutez une entrée ici ; l’identifiant (à gauche) est ce qu’on écrit dans l’article.

export const authors = {
  'francis-couture': { name: 'Francis Couture', role: { fr: 'Cofondateur, PDG', en: 'Co-founder, CEO' } },
  'mikael-gelinas': {
    name: 'Mikaël Gélinas',
    role: { fr: 'Cofondateur, Scientifique de données', en: 'Co-founder, Data Scientist' },
  },
  'olivier-bloch': {
    name: 'Olivier Bloch',
    role: { fr: 'Cofondateur, Scientifique de données', en: 'Co-founder, Data Scientist' },
  },
  // Texte signé collectivement : publié au nom de l’organisation.
  'equipe-artifici': { name: { fr: 'L’équipe Artifici', en: 'The Artifici team' }, organization: true },
};

export const categories = {
  argumently: { fr: 'Argumently', en: 'Argumently' },
  'argument-mining': { fr: 'Argument mining', en: 'Argument mining' },
  'ia-locale': { fr: 'IA locale', en: 'Local AI' },
  'decision-collaborative': { fr: 'Décision collaborative', en: 'Collaborative decision-making' },
};
