import { ref, set, get } from 'firebase/database'
import { db } from '../firebase'
import { generatePackCode } from './codes'

export async function savePack(name, spectra) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const packCode = generatePackCode()
    const packRef = ref(db, `packs/${packCode}`)
    const snapshot = await get(packRef)
    if (snapshot.exists()) continue

    await set(packRef, { name, spectra, createdAt: Date.now() })
    return packCode
  }
  throw new Error('Impossible de générer un code de pack, réessayez.')
}

export async function loadPack(packCode) {
  const id = packCode.trim().toUpperCase()
  const snapshot = await get(ref(db, `packs/${id}`))
  if (!snapshot.exists()) {
    throw new Error('Pack introuvable.')
  }
  return { id, ...snapshot.val() }
}
