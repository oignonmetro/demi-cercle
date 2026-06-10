import { ref, set, update, get, onValue, runTransaction, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { generateRoomCode } from './codes'
import { assignRounds, getGuessSourceId, computeScore } from './logic'

const EMPTY_GUESSES = [
  { guessedAngle: 90, done: false },
  { guessedAngle: 90, done: false },
  { guessedAngle: 90, done: false },
]

export async function createRoom(playerId, playerName) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const roomCode = generateRoomCode()
    const roomRef = ref(db, `rooms/${roomCode}`)
    const snapshot = await get(roomRef)
    if (snapshot.exists()) continue

    await set(roomRef, {
      createdAt: serverTimestamp(),
      hostId: playerId,
      status: 'lobby',
      players: {
        [playerId]: { name: playerName, score: 0 },
      },
      order: [playerId],
    })
    return roomCode
  }
  throw new Error("Impossible de générer un code de salle, réessayez.")
}

export async function joinRoom(roomCode, playerId, playerName) {
  const roomRef = ref(db, `rooms/${roomCode}`)
  const snapshot = await get(roomRef)
  if (!snapshot.exists()) {
    throw new Error("Cette salle n'existe pas.")
  }
  const room = snapshot.val()
  if (room.players?.[playerId]) {
    return
  }
  if (room.status !== 'lobby') {
    throw new Error('La partie a déjà commencé.')
  }
  const order = [...(room.order || []), playerId]
  await update(roomRef, {
    [`players/${playerId}`]: { name: playerName, score: 0 },
    order,
  })
}

export function subscribeRoom(roomCode, callback) {
  const roomRef = ref(db, `rooms/${roomCode}`)
  return onValue(roomRef, (snapshot) => callback(snapshot.val()))
}

export async function selectPack(roomCode, pack) {
  await set(ref(db, `rooms/${roomCode}/pack`), {
    name: pack.name,
    spectra: pack.spectra,
  })
}

export async function startGame(roomCode, room) {
  const order = room.order
  const rounds = assignRounds(room.pack.spectra, order)
  const guesses = Object.fromEntries(order.map((id) => [id, EMPTY_GUESSES.map((g) => ({ ...g }))]))

  await update(ref(db, `rooms/${roomCode}`), {
    status: 'clue-writing',
    rounds,
    guesses,
    results: null,
  })
}

export async function submitClue(roomCode, playerId, roundIndex, clue) {
  await update(ref(db, `rooms/${roomCode}/rounds/${playerId}/${roundIndex}`), { clue })
}

export async function setRoundReady(roomCode, playerId, roundIndex, ready) {
  await update(ref(db, `rooms/${roomCode}/rounds/${playerId}/${roundIndex}`), { ready })
}

export async function submitGuess(roomCode, playerId, roundIndex, guessedAngle) {
  await update(ref(db, `rooms/${roomCode}/guesses/${playerId}/${roundIndex}`), { guessedAngle })
}

export async function setGuessDone(roomCode, playerId, roundIndex, done) {
  await update(ref(db, `rooms/${roomCode}/guesses/${playerId}/${roundIndex}`), { done })
}

// Fait avancer la salle de "clue-writing" à "guessing" si tous les indices
// sont prêts. Utilise une transaction pour qu'un seul client effectue le
// changement même si plusieurs joueurs le détectent en même temps.
export async function tryAdvanceToGuessing(roomCode) {
  const roomRef = ref(db, `rooms/${roomCode}`)
  await runTransaction(roomRef, (room) => {
    if (!room || room.status !== 'clue-writing') return room
    const allReady = room.order.every((playerId) =>
      (room.rounds?.[playerId] || []).every((round) => round.ready)
    )
    if (!allReady) return room
    room.status = 'guessing'
    return room
  })
}

// Fait avancer la salle de "guessing" à "results", calcule les scores et
// les écarts pour chaque manche. Idem, protégé par transaction.
export async function tryAdvanceToResults(roomCode) {
  const roomRef = ref(db, `rooms/${roomCode}`)
  await runTransaction(roomRef, (room) => {
    if (!room || room.status !== 'guessing') return room
    const allDone = room.order.every((playerId) =>
      (room.guesses?.[playerId] || []).every((g) => g.done)
    )
    if (!allDone) return room

    const results = {}
    room.order.forEach((playerId) => {
      const sourceId = getGuessSourceId(room.order, playerId)
      const sourceRounds = room.rounds[sourceId] || []
      const playerGuesses = room.guesses[playerId] || []

      results[playerId] = sourceRounds.map((round, i) => {
        const guess = playerGuesses[i] || { guessedAngle: 90 }
        const score = computeScore(round.needleAngle, guess.guessedAngle)
        room.players[playerId].score = (room.players[playerId].score || 0) + score
        room.players[sourceId].score = (room.players[sourceId].score || 0) + score
        return {
          sourceId,
          spectrumIndex: round.spectrumIndex,
          clue: round.clue,
          actualAngle: round.needleAngle,
          guessedAngle: guess.guessedAngle,
          score,
        }
      })
    })

    room.results = results
    room.status = 'results'
    return room
  })
}

// Relance une nouvelle partie dans la même salle (mêmes joueurs, scores remis à zéro).
export async function playAgain(roomCode, room) {
  const updates = {
    status: 'lobby',
    rounds: null,
    guesses: null,
    results: null,
  }
  room.order.forEach((playerId) => {
    updates[`players/${playerId}/score`] = 0
  })
  await update(ref(db, `rooms/${roomCode}`), updates)
}
