// Génération de codes courts et lisibles (sans caractères ambigus : 0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode(length) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export function generateRoomCode() {
  return randomCode(4)
}

export function generatePackCode() {
  return randomCode(6)
}
