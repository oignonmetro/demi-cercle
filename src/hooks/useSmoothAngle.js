import { useEffect, useRef, useState } from 'react'

// Lisse les sauts discrets d'un angle reçu par le réseau (≈10 mises à jour par
// seconde, avec de la gigue) en une rotation continue : à chaque frame, l'angle
// affiché se rapproche de la cible d'une fraction qui dépend du temps écoulé
// (lissage exponentiel, indépendant du framerate). Résultat : le rendu en
// direct de l'aiguille d'un autre joueur ne saccade plus.
export function useSmoothAngle(target, tauMs = 80) {
  const [angle, setAngle] = useState(target)
  const angleRef = useRef(target)
  const frameRef = useRef(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    // Nouvelle cible : (re)lance une boucle d'animation qui converge dessus.
    lastTimeRef.current = 0

    const tick = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now
      const dt = now - lastTimeRef.current
      lastTimeRef.current = now

      const diff = target - angleRef.current
      if (Math.abs(diff) < 0.1) {
        angleRef.current = target
        setAngle(target)
        return // arrivé : on arrête la boucle jusqu'au prochain changement
      }
      const k = 1 - Math.exp(-dt / tauMs)
      angleRef.current += diff * k
      setAngle(angleRef.current)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, tauMs])

  return angle
}
