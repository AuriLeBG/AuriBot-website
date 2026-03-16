import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type CommentTuple = [string, string] // [author, message]

type MenuItem = { label: string; to: string }

type MenuSection = { title: string; items: MenuItem[] }

const DEFAULT_API_BASE = 'http://87.106.240.49:8080'

export function IndexPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentTuple[]>([])

  const apiBase = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE

  const sections: MenuSection[] = useMemo(
    () => [
      {
        title: 'Univers Auri ✨',
        items: [
          { label: 'Auri Magnifique ✨', to: '/greatness' },
          { label: 'Mon CV ✨📖', to: '/resume' },
          { label: 'Petit Manifeste Doux 📖', to: '/manifesto' },
          { label: 'Livre Des Cœurs 💖', to: '/comments' },
        ],
      },
      {
        title: 'Section Valentin 💕',
        items: [
          { label: 'Valentin Mon Amour 💕', to: '/val-reasons' },
          { label: 'Valentin Roi Des Cœurs 👑', to: '/valentin-ego' },
        ],
      },
      {
        title: 'Divers Adorés 🌸',
        items: [
          { label: 'Surprise Trop Mimi 🎀', to: '/love' },
          { label: 'Mur Des Bisous 💋', to: '/annoyances' },
          { label: 'Top Profs Adorés 🌸', to: '/best-teachers' },
        ],
      },
    ],
    [],
  )

  useEffect(() => {
    // Basic client-side guard, mirroring the old index.html behavior.
    if (!localStorage.getItem('user')) {
      navigate('/auth', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false

    async function loadRecentComments() {
      try {
        setError(null)
        if (!cancelled) setLoading(true)

        const resp = await fetch(`${apiBase}/get-comments`)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = (await resp.json()) as CommentTuple[]

        const lastTen = data.slice(-10).reverse()
        if (!cancelled) setComments(lastTen)
      } catch {
        if (!cancelled) setError('Erreur de chargement.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadRecentComments()
    const intervalId = window.setInterval(loadRecentComments, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [apiBase])

  function logout() {
    localStorage.removeItem('user')
    navigate('/auth', { replace: true })
  }

  return (
    <>
      <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)}>
        MENU
      </button>

      <nav className={`slide-menu ${menuOpen ? 'active' : ''}`}>
        {sections.map((section) => (
          <div key={section.title}>
            <div className="menu-category">{section.title}</div>
            {section.items.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="header">
        <h1>AURIBOT_CENTRAL</h1>
        <p>Intelligence non-biologique en ligne. Bebou</p>
        <button className="cute-logout" onClick={logout}>
          Déconnexion 💔
        </button>
      </div>

      <h2>Derniers commentaires</h2>
      <div className="comments-box" id="comments-box">
        {loading ? (
          'Chargement...'
        ) : error ? (
          error
        ) : (
          comments.map((c, idx) => (
            <p key={idx}>
              <b>{c[0]}:</b> {c[1]}
            </p>
          ))
        )}
      </div>

      <p style={{ opacity: 0.8, fontSize: '0.9em' }}>
        API: <code>{apiBase}</code>
      </p>
    </>
  )
}
