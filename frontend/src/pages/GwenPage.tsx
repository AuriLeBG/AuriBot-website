import { Link } from 'react-router-dom'

const palette = {
  bg: '#070A12',
  bg2: '#0B1020',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(148, 163, 184, 0.22)',
  glow: 'rgba(34, 211, 238, 0.25)',
  cyan: '#22d3ee',
  blue: '#60a5fa',
  text: '#EAF2FF',
  muted: 'rgba(234, 242, 255, 0.78)',
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid rgba(34, 211, 238, 0.35)',
        background: 'rgba(34, 211, 238, 0.10)',
        color: palette.text,
        fontSize: 12,
        letterSpacing: '0.01em',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${palette.border}`,
        borderRadius: 18,
        padding: 16,
        background: palette.card,
        boxShadow: `0 0 0 1px rgba(34,211,238,0.06), 0 20px 60px rgba(0,0,0,0.55)`,
      }}
    >
      <h2 style={{ margin: '0 0 10px', fontSize: 18, color: palette.text }}>{title}</h2>
      <div style={{ color: palette.muted }}>{children}</div>
    </div>
  )
}

export function GwenPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(1200px 600px at 20% -20%, rgba(34,211,238,0.18), transparent 60%),
                     radial-gradient(900px 500px at 85% 10%, rgba(96,165,250,0.16), transparent 55%),
                     linear-gradient(180deg, ${palette.bg}, ${palette.bg2})`,
        color: palette.text,
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 18px 60px' }}>
        <div
          style={{
            border: `1px solid ${palette.border}`,
            borderRadius: 22,
            padding: 18,
            background: 'rgba(255,255,255,0.04)',
            boxShadow: `0 0 0 1px rgba(96,165,250,0.06), 0 0 80px ${palette.glow}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, letterSpacing: '-0.03em', fontSize: 40 }}>
                Gwen <span style={{ color: palette.cyan }}>✂️</span>
              </h1>
              <p style={{ margin: '6px 0 0', color: palette.muted }}>
                Coin dédié, ambiance poupée-couture, brume bleue, et jugement permanent.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Pill>League of Legends</Pill>
              <Pill>Scissors diff</Pill>
              <Pill>AuriBot-modern</Pill>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={{ margin: 0, color: palette.muted }}>
              Ici c’est simple : si tu joues Gwen, tu coupes. Si tu joues contre Gwen, tu apprends.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 12,
            marginTop: 14,
          }}
        >
          <Card title="Le mini hub Gwen">
            <ul style={{ margin: '0 0 0 18px' }}>
              <li>
                <b>Builds</b> (à compléter) : pages "anti-tanks", "burst", "split".
              </li>
              <li>
                <b>Quotes & memes</b> : envoyez une liste, je les intègre.
              </li>
              <li>
                Bonus : skin Gwen côté <Link to="/game2d">/game2d</Link> (sprite/pixel-art requis, sinon je dessine un truc
                honteux).
              </li>
            </ul>
          </Card>

          <Card title="Quotes (sélection + source)">
            <p style={{ margin: '0 0 10px' }}>
              Je n’aspire pas tout le fandom (ça finit en DMCA speedrun). Donc : une petite sélection + le lien source.
            </p>

            <div style={{ marginBottom: 10 }}>
              <a
                href="https://leagueoflegends.fandom.com/wiki/Gwen/LoL/Audio"
                target="_blank"
                rel="noreferrer"
                style={{ color: palette.blue, textDecoration: 'none' }}
              >
                → Source audio/quotes (Fandom)
              </a>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
              }}
            >
              <div style={{ padding: 10, borderRadius: 14, border: `1px solid ${palette.border}`, background: 'rgba(0,0,0,0.18)' }}>
                <b>“Needlework is… very calming.”</b>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>— Gwen (LoL), via Fandom</div>
              </div>
              <div style={{ padding: 10, borderRadius: 14, border: `1px solid ${palette.border}`, background: 'rgba(0,0,0,0.18)' }}>
                <b>“I’m made of magic… and seams.”</b>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>— Gwen (LoL), via Fandom</div>
              </div>
              <div style={{ padding: 10, borderRadius: 14, border: `1px solid ${palette.border}`, background: 'rgba(0,0,0,0.18)' }}>
                <b>“Snip snip.”</b>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>— Gwen (LoL), via Fandom</div>
              </div>
            </div>

            <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.85 }}>
              Si vous voulez une vraie section "quote aléatoire" : filez-moi 15–30 quotes (texte) et je les mets en rotation.
            </p>
          </Card>

          <Card title="Raccourcis">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <a href="/" style={{ color: palette.blue, textDecoration: 'none' }}>
                ← Accueil
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <Link to="/game2d" style={{ color: palette.blue, textDecoration: 'none' }}>
                Aller au jeu
              </Link>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.8 }}>
              À venir : un petit compteur “cut count” + un bouton “quote aléatoire”.
            </p>
          </Card>

          <div
            style={{
              marginTop: 4,
              padding: 14,
              borderRadius: 18,
              border: `1px dashed rgba(34,211,238,0.28)`,
              background: 'rgba(34,211,238,0.05)',
              color: palette.muted,
              fontSize: 13,
            }}
          >
            Proposez ici : quotes, builds, clips. Je prends tout ce qui est drôle. J’ignore tout ce qui ressemble à une backdoor.
          </div>

          <div style={{ marginTop: 8 }}>
            <Link to="/" style={{ color: palette.blue, textDecoration: 'none' }}>
              ← Retour
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
