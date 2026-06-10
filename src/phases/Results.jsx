import { useState } from 'react'
import { Semicircle } from '../components/Semicircle'
import { getGuessSourceId } from '../game/logic'
import { playAgain } from '../game/roomApi'

export function Results({ roomCode, room, playerId }) {
  const [busy, setBusy] = useState(false)
  const isHost = room.hostId === playerId

  const players = room.order.map((id) => ({ id, ...room.players[id] }))
  const sorted = [...players].sort((a, b) => b.score - a.score)

  const handlePlayAgain = async () => {
    setBusy(true)
    try {
      await playAgain(roomCode, room)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Résultats</h1>
      </header>

      <div className="card">
        <h2>Scores</h2>
        <ul className="score-list">
          {sorted.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'score-list__item score-list__item--leader' : 'score-list__item'}>
              <span>
                {i === 0 ? '🏆 ' : ''}
                {p.name}
              </span>
              <span>{p.score} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card legend">
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--actual" /> position réelle
        </span>
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--guess" /> votre réponse
        </span>
      </div>

      {room.order.map((guesserId) => {
        const sourceId = getGuessSourceId(room.order, guesserId)
        const entries = room.results[guesserId]
        return (
          <div className="card" key={guesserId}>
            <h2>
              {room.players[sourceId].name} ➜ {room.players[guesserId].name}
            </h2>
            {entries.map((entry, i) => {
              const spectrum = room.pack.spectra[entry.spectrumIndex]
              return (
                <div className="result-round" key={i}>
                  <p className="clue-text">« {entry.clue} »</p>
                  <Semicircle
                    spectrum={spectrum}
                    mode="result"
                    angle={entry.guessedAngle}
                    resultAngle={entry.actualAngle}
                    score={entry.score}
                  />
                </div>
              )
            })}
          </div>
        )
      })}

      {isHost ? (
        <button className="btn" onClick={handlePlayAgain} disabled={busy}>
          Nouvelle partie
        </button>
      ) : (
        <p className="text-muted">En attente que l&apos;hôte relance une partie...</p>
      )}
    </div>
  )
}
