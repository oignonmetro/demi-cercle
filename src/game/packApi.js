import { ref, set, update, get } from 'firebase/database'
import { db } from '../firebase'
import { generatePackCode } from './codes'
import { AppError } from './errors'

export async function savePack(name, spectra) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const packCode = generatePackCode()
    const packRef = ref(db, `packs/${packCode}`)
    const snapshot = await get(packRef)
    if (snapshot.exists()) continue

    await set(packRef, { name, spectra, createdAt: Date.now() })
    return packCode
  }
  throw new AppError('Impossible de générer un code de pack, réessayez.')
}

export async function loadPack(packCode) {
  const id = packCode.trim().toUpperCase()
  const snapshot = await get(ref(db, `packs/${id}`))
  if (!snapshot.exists()) {
    throw new AppError('Pack introuvable.')
  }
  return { id, ...snapshot.val() }
}

// Met à jour le nom et les spectres d'un pack existant (sans changer son code).
export async function updatePack(packCode, name, spectra) {
  const id = packCode.trim().toUpperCase()
  await update(ref(db, `packs/${id}`), { name, spectra })
}

// Retrouve des packs par leur nom (insensible à la casse), pour récupérer un
// code perdu (cache du navigateur effacé). La collection est lue en entier et
// filtrée côté client : elle reste petite, et la base n'indexe pas les noms.
export async function findPacksByName(name) {
  const wanted = name.trim().toLowerCase()
  if (!wanted) return []
  const snapshot = await get(ref(db, 'packs'))
  if (!snapshot.exists()) return []
  return Object.entries(snapshot.val())
    .filter(([, pack]) => (pack.name || '').toLowerCase().includes(wanted))
    .map(([id, pack]) => ({
      id,
      name: pack.name,
      spectraCount: Array.isArray(pack.spectra) ? pack.spectra.length : 0,
      createdAt: pack.createdAt ?? null,
    }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}
