import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type TileState = 'empty' | 'absent' | 'present' | 'correct'

const WORDS_5 = [
  // Small, safe, local list (no API). Add more if you want.
  // French-ish + some neutral words; keep 5 letters.
  'AURIS',
  'GWENN',
  'POMME',
  'SALUT',
  'BOBOT',
  'MAGIE',
  'COUTU',
  'CLOUD',
  'DOCKS',
  'VITEA',
  'REACT',
  'SPRIT',
  'FLECH',
  'CISEA',
  'BEBOU',
  'PATCH',
  'ARENE',
  'MINOU',
]

function dayKeyUTC(d = new Date()) {
  // YYYY-MM-DD in UTC, stable across timezones.
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function hashToIndex(str: string, mod: number) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % mod
}

function scoreGuess(secret: string, guess: string): TileState[] {
  const s = secret.split('')
  const g = guess.split('')
  const res: TileState[] = Array(5).fill('absent')

  // mark correct
  const usedS = Array(5).fill(false)
  for (let i = 0; i < 5; i++) {
    if (g[i] === s[i]) {
      res[i] = 'correct'
      usedS[i] = true
      g[i] = '\0'
    }
  }

  // mark present
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'correct') continue
    const ch = g[i]
    if (ch === '\0') continue

    let found = -1
    for (let j = 0; j < 5; j++) {
      if (!usedS[j] && s[j] === ch) {
        found = j
        break
      }
    }

    if (found >= 0) {
      res[i] = 'present'
      usedS[found] = true
    } else {
      res[i] = 'absent'
    }
  }

  // empty for incomplete
  for (let i = 0; i < 5; i++) if (!guess[i] || guess[i] === ' ') res[i] = 'empty'
  return res
}

function isAlphaKey(k: string) {
  return k.length === 1 && k.toUpperCase() !== k.toLowerCase()
}

export function WordlePage() {
  const today = useMemo(() => dayKeyUTC(), [])
  const secret = useMemo(() => {
    const idx = hashToIndex(`auribot-wordle:${today}`, WORDS_5.length)
    return WORDS_5[idx]
  }, [today])

  const storageKey = `wordle:${today}`

  const [rows, setRows] = useState<string[]>(Array(6).fill(''))
  const [rowIdx, setRowIdx] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return
      const parsed = JSON.parse(saved) as { rows: string[]; rowIdx: number; done: boolean }
      if (parsed?.rows?.length === 6) setRows(parsed.rows)
      if (typeof parsed?.rowIdx === 'number') setRowIdx(parsed.rowIdx)
      if (typeof parsed?.done === 'boolean') setDone(parsed.done)
    } catch {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ rows, rowIdx, done }))
    } catch {
      // ignore
    }
  }, [rows, rowIdx, done, storageKey])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (done) return

      if (e.key === 'Backspace') {
        setRows((prev) => {
          const next = [...prev]
          next[rowIdx] = next[rowIdx].slice(0, -1)
          return next
        })
        return
      }

      if (e.key === 'Enter') {
        setMsg(null)
        const guess = (rows[rowIdx] || '').toUpperCase()
        if (guess.length < 5) {
          setMsg('5 lettres. Pas moins.')
          return
        }

        if (guess === secret) {
          setDone(true)
          setMsg('GG. Tu coupes mieux que Gwen.')
          return
        }

        if (rowIdx >= 5) {
          setDone(true)
          setMsg(`Perdu. Le mot était ${secret}.`) 
          return
        }

        setRowIdx((v) => v + 1)
        return
      }

      if (isAlphaKey(e.key)) {
        const ch = e.key.toUpperCase()
        setRows((prev) => {
          const next = [...prev]
          if ((next[rowIdx] || '').length >= 5) return next
          next[rowIdx] = (next[rowIdx] || '') + ch
          return next
        })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [done, rowIdx, rows, secret])

  function resetToday() {
    setRows(Array(6).fill(''))
    setRowIdx(0)
    setDone(false)
    setMsg(null)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignore
    }
  }

  const palette = {
    bg: '#0b1020',
    card: 'rgba(255,255,255,0.06)',
    border: 'rgba(148, 163, 184, 0.22)',
    text: '#EAF2FF',
    muted: 'rgba(234, 242, 255, 0.72)',
    correct: '#22c55e',
    present: '#eab308',
    absent: 'rgba(148, 163, 184, 0.25)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(900px 500px at 20% -20%, rgba(96,165,250,0.18), transparent 60%), linear-gradient(180deg, #070A12, ${palette.bg})`,
        color: palette.text,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '26px 16px 60px' }}>
        <h1 style={{ margin: 0, letterSpacing: '-0.03em' }}>Wordle (version Auri)</h1>
        <p style={{ margin: '8px 0 0', color: palette.muted }}>
          6 essais. 5 lettres. Pas de pitié. (Mot du jour en UTC : <code>{today}</code>)
        </p>

        <div
          style={{
            marginTop: 14,
            border: `1px solid ${palette.border}`,
            borderRadius: 18,
            background: palette.card,
            padding: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map((r, i) => {
              const guess = (r || '').padEnd(5, ' ')
              const states = i < rowIdx || (done && i === rowIdx) ? scoreGuess(secret, guess.trimEnd()) : scoreGuess(secret, '')

              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {Array.from({ length: 5 }).map((_, j) => {
                    const ch = guess[j] === ' ' ? '' : guess[j]
                    const st = i < rowIdx ? states[j] : i === rowIdx && guess.trim().length === 5 && done ? states[j] : i < rowIdx ? states[j] : 'empty'

                    const bg =
                      st === 'correct'
                        ? palette.correct
                        : st === 'present'
                          ? palette.present
                          : st === 'absent'
                            ? palette.absent
                            : 'rgba(0,0,0,0.18)'

                    return (
                      <div
                        key={j}
                        style={{
                          height: 52,
                          borderRadius: 12,
                          border: `1px solid ${palette.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'monospace',
                          fontSize: 22,
                          fontWeight: 800,
                          background: bg,
                          color: st === 'empty' ? palette.text : '#0b1020',
                        }}
                      >
                        {ch}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={resetToday}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: `1px solid ${palette.border}`,
                background: 'rgba(0,0,0,0.25)',
                color: palette.text,
                cursor: 'pointer',
              }}
            >
              Reset (aujourd’hui)
            </button>

            <span style={{ color: palette.muted, fontSize: 13 }}>
              Controls: <b>AZERTY/Keyboard</b>, <b>Enter</b>, <b>Backspace</b>
            </span>
          </div>

          {msg && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 12, border: `1px dashed ${palette.border}`, color: palette.muted }}>
              {msg}
            </div>
          )}
        </div>

        <p style={{ marginTop: 14 }}>
          <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            ← Retour
          </Link>
        </p>

        <p style={{ marginTop: 8, color: 'rgba(234, 242, 255, 0.55)', fontSize: 12 }}>
          Note: la liste de mots est volontairement petite et locale. Si tu veux du vrai Wordle FR, on peut brancher un dictionnaire —
          mais ça implique du contenu externe et plus de vérifs.
        </p>
      </div>
    </div>
  )
}
