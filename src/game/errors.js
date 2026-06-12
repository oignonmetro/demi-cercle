// Erreurs métier dont le message est destiné à être affiché tel quel
// à l'utilisateur (déjà rédigé en français).
export class AppError extends Error {}

// Message d'erreur à afficher : nos erreurs métier passent telles quelles,
// tout le reste (erreurs Firebase/réseau, techniques et en anglais) est
// remplacé par un message générique convivial.
export function userMessage(err) {
  if (err instanceof AppError) return err.message
  return 'Un problème de connexion est survenu. Réessaie.'
}
