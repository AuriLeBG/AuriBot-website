import { Link } from 'react-router-dom'

export function ValentinEgoPage() {
  return (
    <div
      style={{
        fontFamily: `'Courier New', monospace`,
        backgroundColor: '#1a1a1a',
        padding: 20,
        textAlign: 'left',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          background: '#1a1b26',
          border: '1px solid #414868',
          padding: 20,
          width: '80%',
          margin: '0 auto',
          borderRadius: 5,
        }}
      >
        {[
          ['1', '# Valentin_Muscu.narcissist'],
          ['2', '--------------------------------'],
          ['3', 'status: "PUMPED"'],
          ['4', 'ego: "MAX_LEVEL"'],
          ['5', '--------------------------------'],
          ['6', '💪 100% Muscle, 0% Bug'],
          ['7', "🏋️‍♂️ La salle de sport est mon église."],
          ['8', '🦁 Le miroir est mon meilleur ami.'],
          ['9', '⚠️ Attention : narcissisme saturé.'],
          ['10', ''],
          ['11', '-- NORMAL MODE --'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex' }}>
            <span style={{ color: '#565f89', marginRight: 15, userSelect: 'none' }}>{n}</span>
            <span style={{ color: '#a9b1d6' }}>{t}</span>
          </div>
        ))}
      </div>
      <br />
      <Link to="/" style={{ color: '#f7768e', fontWeight: 'bold', border: 'none', background: 'transparent' }}>
        &lt; Retour
      </Link>

      <p style={{ color: '#a9b1d6', maxWidth: 800, margin: '16px auto' }}>
        Note: l'ancienne page demandait un mot de passe via un endpoint <code>/check-password</code>.
        Il n'est pas encore implémenté côté Spring, donc cette version est non-protégée pour l'instant.
      </p>
    </div>
  )
}
