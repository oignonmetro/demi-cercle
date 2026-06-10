// Logique pure du jeu : tirage des aiguilles, calcul des scores,
// répartition des spectres et rotation des devinettes.

const ROUNDS_PER_PLAYER = 3

// Mélange Fisher-Yates (ne modifie pas le tableau d'origine)
function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Angle entre 5° et 175° pour éviter les positions exactement aux extrémités.
export function randomAngle() {
  return Math.floor(Math.random() * 171) + 5
}

// Score entre 0 et 100 selon l'écart entre la position réelle et devinée (sur 180°).
export function computeScore(actualAngle, guessedAngle) {
  const diff = Math.abs(actualAngle - guessedAngle)
  return Math.round(Math.max(0, 100 - (diff / 180) * 100))
}

// Attribue 3 spectres + une position d'aiguille à chaque joueur.
export function assignRounds(spectra, playerIds) {
  const needed = playerIds.length * ROUNDS_PER_PLAYER
  const baseIndices = spectra.map((_, i) => i)

  let pool = shuffle(baseIndices)
  while (pool.length < needed) {
    pool = pool.concat(shuffle(baseIndices))
  }
  pool = pool.slice(0, needed)

  const assignments = {}
  playerIds.forEach((playerId, i) => {
    assignments[playerId] = pool
      .slice(i * ROUNDS_PER_PLAYER, (i + 1) * ROUNDS_PER_PLAYER)
      .map((spectrumIndex) => ({
        spectrumIndex,
        needleAngle: randomAngle(),
        clue: '',
        ready: false,
      }))
  })
  return assignments
}

// Le joueur `playerId` devine les indices écrits par le joueur précédent dans l'ordre.
export function getGuessSourceId(order, playerId) {
  const n = order.length
  const idx = order.indexOf(playerId)
  return order[(idx - 1 + n) % n]
}

// Construit la liste des tours de devinette, joués un par un devant tout le
// monde : manche 0 de chaque joueur (A devine B, B devine C, ...), puis
// manche 1, puis manche 2.
export function buildTurns(order) {
  const turns = []
  for (let roundIndex = 0; roundIndex < ROUNDS_PER_PLAYER; roundIndex++) {
    order.forEach((guesserId) => {
      turns.push({
        guesserId,
        sourceId: getGuessSourceId(order, guesserId),
        roundIndex,
      })
    })
  }
  return turns
}
