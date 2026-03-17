import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Mode = 'signup' | 'login'

export function AuthPage() {
  const navigate = useNavigate()
  // Default: same-origin (works with Vite proxy / nginx reverse-proxy). Override with VITE_API_BASE if needed.
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE || '', [])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function auth(mode: Mode) {
    setBusy(true)
    setMessage(null)
    try {
      const resp = await fetch(`${apiBase}/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (resp.ok) {
        localStorage.setItem('user', username)
        navigate('/', { replace: true })
      } else {
        const txt = await resp.text()
        setMessage(`Erreur : ${txt}`)
      }
    } catch {
      setMessage('Erreur : impossible de contacter le serveur.')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void auth('login')
  }

  return (
    <>
      <h1>AUTHENTIFICATION_DOUCE_💖</h1>

      <div className="comments-box">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            autoComplete="username"
            disabled={busy}
            style={{ width: '95%', padding: 10, marginBottom: 10, borderRadius: 12 }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoComplete={"current-password"}
            disabled={busy}
            style={{ width: '95%', padding: 10, marginBottom: 10, borderRadius: 12 }}
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cute-logout"
              disabled={busy}
              onClick={() => void auth('signup')}
            >
              S'inscrire
            </button>
            <button type="submit" className="cute-logout" disabled={busy}>
              Se connecter
            </button>
          </div>

          <p style={{ minHeight: 24 }}>{message}</p>
        </form>
      </div>

      <br />
      <br />
      <Link to="/">← Retour</Link>

      <p style={{ opacity: 0.75, fontSize: '0.9em' }}>
        API: <code>{apiBase}</code>
      </p>
    </>
  )
}
