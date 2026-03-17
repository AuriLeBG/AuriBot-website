import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type CommentTuple = [string, string]

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' }

export function CommentsPage() {
  const navigate = useNavigate()
  // Default: same-origin (works with Vite proxy / nginx reverse-proxy). Override with VITE_API_BASE if needed.
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE || '', [])

  const user = localStorage.getItem('user')

  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [comments, setComments] = useState<CommentTuple[]>([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!user) navigate('/auth', { replace: true })
  }, [navigate, user])

  async function loadComments() {
    setState({ kind: 'loading' })
    try {
      const resp = await fetch(`${apiBase}/get-comments`)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = (await resp.json()) as CommentTuple[]
      setComments(data)
      setState({ kind: 'ready' })
    } catch {
      setState({ kind: 'error', message: 'Erreur de chargement.' })
    }
  }

  useEffect(() => {
    void loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase])

  async function postComment() {
    if (!user) return
    if (!content.trim()) return

    setPosting(true)
    try {
      await fetch(`${apiBase}/post-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: user, content }),
      })
      setContent('')
      await loadComments()
    } finally {
      setPosting(false)
    }
  }

  return (
    <>
      <h1>LIVRE_D_OR</h1>

      <div className="comments-box" style={{ height: 360 }}>
        {state.kind === 'loading'
          ? 'Chargement...'
          : state.kind === 'error'
            ? state.message
            : comments.map((c, idx) => (
                <p key={idx}>
                  <b>{c[0]}:</b> {c[1]}
                </p>
              ))}
      </div>

      <p>
        Connecté en tant que : <b>{user ?? '(pas connecté)'}</b>
      </p>

      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ton message"
        disabled={posting}
        style={{ width: '80%', maxWidth: 500, padding: 10, borderRadius: 12 }}
      />
      <div style={{ marginTop: 10 }}>
        <button className="cute-logout" onClick={() => void postComment()} disabled={posting}>
          Poster
        </button>
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
