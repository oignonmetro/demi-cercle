import { useEffect, useState } from 'react'
import { subscribeRoom } from '../game/roomApi'

// S'abonne en temps réel à l'état d'une salle Firebase.
export function useRoom(roomCode) {
  const [state, setState] = useState({ roomCode: null, room: null })

  useEffect(() => {
    if (!roomCode) return undefined
    const unsubscribe = subscribeRoom(roomCode, (data) => {
      setState({ roomCode, room: data })
    })
    return unsubscribe
  }, [roomCode])

  if (!roomCode) {
    return { room: null, loading: false }
  }
  if (state.roomCode !== roomCode) {
    return { room: null, loading: true }
  }
  return { room: state.room, loading: false }
}
