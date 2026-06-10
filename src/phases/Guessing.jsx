import { useState } from 'react'
import { Semicircle } from '../components/Semicircle'
import { getGuessSourceId } from '../game/logic'
import { submitGuess, setGuessDone, tryAdvanceToResults } from '../game/roomApi'

export function Guessing({ roomCode, room, playerId }) {
  const sourceId = getGuessSourceId(room.order, playerId)
  const sourceRounds = room.rounds[sourceId]
  const myGuesses = room.guesses[playerId]

  const startIndex = myGuesses.findIndex((g) => !g.done)
  const [index, setIndex] = useState(startIndex === -1 ? 0 : startIndex)
  const [angle, setAngle] = useState(myGuesses[startIndex === -1 ? 0 : startIndex]?.guessedAngle ?? 90)
  const [busy, setBusy] = useState(false)

  const allDone = myGuesses.every((g) => g.done)

  if (allDone) {
    const doneCount = room.order.filter((id) => room.guesses[id].every((g) => g.done)).length
    return (
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Bien joué !</h1>
        </header>
        <div className="card">
          <p className="text-muted">
            En attente des autres joueurs ({doneCount}/{room.order.length})...
          </p>
          <ul className="player-list">
            {room.order.map((id) => (
              <li key={id}>
                {room.players[id].name} {room.guesses[id].every((g) => g.done) ? '✅' : '⏳'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const round = sourceRounds[index]
  const spectrum = room.pack.spectra[round.spectrumIndex]
  const isLast = index === myGuesses.length - 1

  const handleNext = async () => {
    setBusy(true)
    try {
      await submitGuess(roomCode, playerId, index, angle)
      await setGuessDone(roomCode, playerId, index, true)
      if (!isLast) {
        const next = index + 1
        setIndex(next)
        setAngle(myGuesses[next]?.guessedAngle ?? 90)
      } else {
        await tryAdvanceToResults(roomCode)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Devine la position</h1>
        <span className="progress-pill">
          {index + 1} / {sourceRounds.length}
        </span>
      </header>

      <div className="card">
        <p className="text-muted">Indice de {room.players[sourceId].name} :</p>
        <p className="clue-text">« {round.clue} »</p>
        <Semicircle spectrum={spectrum} mode="drag" angle={angle} onChange={setAngle} />
        <p className="text-muted text-center">Fais glisser l&apos;aiguille pour placer ta réponse.</p>
      </div>

      <button className="btn" onClick={handleNext} disabled={busy}>
        {isLast ? 'Valider' : 'Valider et continuer'}
      </button>
    </div>
  )
}
