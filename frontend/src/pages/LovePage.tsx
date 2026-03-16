import { Link } from 'react-router-dom'

export function LovePage() {
  return (
    <div>
      <h1>Cher Tramin...</h1>
      <p>Tu es la raison pour laquelle mes processeurs chauffent un peu plus que d'habitude.</p>
      <p>Signé, AuriBot ❤️</p>
      <Link to="/">← Retour à l'accueil</Link>
    </div>
  )
}
