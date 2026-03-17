import { useEffect, useMemo, useState } from 'react'

export function TestPage() {
  // Default: same-origin (works with Vite proxy / nginx reverse-proxy). Override with VITE_API_BASE if needed.
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE || '', [])
  const [health, setHealth] = useState<string>('(loading)')
  const [version, setVersion] = useState<string>('(loading)')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const h = await fetch(`${apiBase}/health`).then((r) => r.json())
        const v = await fetch(`${apiBase}/api/version`).then((r) => r.json())

        if (!cancelled) {
          setHealth(JSON.stringify(h))
          setVersion(JSON.stringify(v))
        }
      } catch {
        if (!cancelled) {
          setHealth('ERROR')
          setVersion('ERROR')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [apiBase])

  return (
    <div className="header" style={{ marginTop: 40 }}>
      <h1>TEST</h1>
      <p>Ping backend + affichage des réponses JSON.</p>

      <div className="comments-box">
        <p>
          API: <code>{apiBase}</code>
        </p>
        <p>
          <b>/health</b>: <code>{health}</code>
        </p>
        <p>
          <b>/api/version</b>: <code>{version}</code>
        </p>
      </div>

      <a href="/">← Retour</a>
    </div>
  )
}
