import { Link } from 'react-router-dom'

export function GwenPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1 style={{ letterSpacing: '-0.02em' }}>Gwen</h1>
      <p style={{ opacity: 0.85 }}>
        Espace dédié à Gwen. Oui, c’est gratuit. Non, il n’y a pas de raison valable. Donc c’est parfait.
      </p>

      <div
        style={{
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 16,
          padding: 16,
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Idées à ajouter</h2>
        <ul>
          <li>Un mini “mur de builds” (items/runes patch par patch).</li>
          <li>Une galerie de quotes / memes.</li>
          <li>
            Bonus : un sprite Gwen dans <Link to="/game2d">/game2d</Link> (si quelqu’un fournit un sprite/pixel-art).
          </li>
        </ul>
        <p style={{ marginBottom: 0, opacity: 0.8 }}>
          Balancez vos demandes ici, je prends (tant que c’est du fun et pas une backdoor).
        </p>
      </div>

      <p style={{ marginTop: 16 }}>
        <Link to="/">← Retour</Link>
      </p>
    </div>
  )
}
