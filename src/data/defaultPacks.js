// Packs de spectres fournis par défaut.
// Chaque spectre est un couple { left, right } représentant les deux extrémités
// du demi-cercle ("X" à gauche, "non-X" à droite).

export const DEFAULT_PACKS = [
  {
    id: 'classique',
    name: 'Classique',
    spectra: [
      { left: 'Bon', right: 'Mauvais' },
      { left: 'Chaud', right: 'Froid' },
      { left: 'Beau', right: 'Moche' },
      { left: 'Utile', right: 'Inutile' },
      { left: 'Drôle', right: 'Ennuyeux' },
      { left: 'Cher', right: 'Pas cher' },
      { left: 'Rapide', right: 'Lent' },
      { left: 'Facile', right: 'Difficile' },
      { left: 'Sain', right: 'Malsain' },
      { left: 'Calme', right: 'Stressant' },
      { left: 'Sûr', right: 'Dangereux' },
      { left: 'Propre', right: 'Sale' },
      { left: 'Discret', right: 'Tape-à-l\'œil' },
      { left: 'Original', right: 'Banal' },
      { left: 'Confortable', right: 'Inconfortable' },
    ],
  },
  {
    id: 'culture-societe',
    name: 'Culture & Société',
    spectra: [
      { left: 'Sous-coté', right: 'Surcoté' },
      { left: 'Vieux jeu', right: 'Avant-gardiste' },
      { left: 'Élitiste', right: 'Populaire' },
      { left: 'Sérieux', right: 'Léger' },
      { left: 'Local', right: 'International' },
      { left: 'Réaliste', right: 'Fantaisiste' },
      { left: 'Discret', right: 'Médiatisé' },
      { left: 'Traditionnel', right: 'Moderne' },
      { left: 'Intellectuel', right: 'Divertissant' },
      { left: 'Consensuel', right: 'Clivant' },
    ],
  },
  {
    id: 'fun-absurde',
    name: 'Fun & Absurde',
    spectra: [
      { left: 'Comestible', right: 'Immangeable' },
      { left: 'Adapté à un mariage', right: 'Inadapté à un mariage' },
      { left: 'Ferait un robot', right: 'Ferait un humain' },
      { left: 'Acceptable au travail', right: 'Inacceptable au travail' },
      { left: 'Digne d\'un super-héros', right: 'Digne d\'un vilain' },
      { left: 'Bruyant', right: 'Silencieux' },
      { left: 'Glamour', right: 'Cradingue' },
      { left: 'Adapté aux enfants', right: 'Réservé aux adultes' },
      { left: 'Présent dans une grotte', right: 'Présent dans un vaisseau spatial' },
      { left: 'Fait pour l\'été', right: 'Fait pour l\'hiver' },
    ],
  },
]
