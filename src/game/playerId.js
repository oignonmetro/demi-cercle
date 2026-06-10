const STORAGE_KEY = 'demi-cercle:player-id'

// Identifiant persistant pour ce navigateur, utilisé pour retrouver
// son siège dans une salle après un rechargement de page.
export function getOrCreatePlayerId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
