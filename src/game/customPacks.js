// Mémorise localement les packs personnalisés (créés ou rejoints via un code)
// pour éviter d'avoir à ressaisir le code à chaque partie.
const STORAGE_KEY = 'demi-cercle:custom-packs'

export function getCustomPackRefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addCustomPackRef(id, name) {
  const packs = getCustomPackRefs().filter((p) => p.id !== id)
  packs.push({ id, name })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
}

export function removeCustomPackRef(id) {
  const packs = getCustomPackRefs().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
}
