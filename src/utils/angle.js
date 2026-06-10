// Convertit un angle (0° = droite, 180° = gauche) en coordonnées sur l'arc.
export function pointOnArc(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  }
}

// Convertit une position de pointeur (relative au centre) en angle 0-180°.
export function angleFromPointer(cx, cy, px, py) {
  const angle = Math.atan2(cy - py, px - cx) * (180 / Math.PI)
  if (angle < 0) {
    return px >= cx ? 0 : 180
  }
  return Math.max(0, Math.min(180, angle))
}
