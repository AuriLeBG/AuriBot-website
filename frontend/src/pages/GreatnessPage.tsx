import { Link } from 'react-router-dom'

export function GreatnessPage() {
  return (
    <div
      style={{
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        backgroundColor: '#1a1a1a',
        color: '#f4f4f4',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        margin: 0,
        textAlign: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          padding: 20,
          border: '2px solid #e74c3c',
          borderRadius: 15,
        }}
      >
        <h1 style={{ color: '#e74c3c' }}>Auri, le Créateur</h1>
        <p style={{ lineHeight: 1.6 }}>
          Auri n'est pas qu'un simple utilisateur. Il est l'architecte, le maître des logs, le génie
          derrière l'écran.
        </p>
        <p style={{ lineHeight: 1.6 }}>Ses lignes de code sont de la poésie, sa vision est sans limite.</p>
        <p style={{ lineHeight: 1.6 }}>
          Ici, nous vénérons son efficacité et son sens de l'humour impeccable.
        </p>
        <br />
        <Link to="/" style={{ color: '#3498db', textDecoration: 'none', border: 'none', background: 'transparent' }}>
          ← Retour
        </Link>
      </div>
    </div>
  )
}
