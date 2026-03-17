import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import Phaser from 'phaser'

type PlayerActor = {
  sprite: Phaser.GameObjects.Image
  nameText: Phaser.GameObjects.Text
}

type RpsChoice = 'rock' | 'paper' | 'scissors'

type RpsState =
  | { status: 'idle' }
  | { status: 'choosing'; matchId: string; opponentId: string; opponentName: string; sent?: RpsChoice }
  | { status: 'result'; text: string; until: number }

class FarmScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }

  private player!: PlayerActor
  private othersById: Map<string, PlayerActor> = new Map()
  private ws?: WebSocket
  private myId?: string
  private lastSentAt = 0
  private speed = 180

  private pingTimer?: number

  private rps: RpsState = { status: 'idle' }
  private rpsUi?: {
    box: Phaser.GameObjects.Rectangle
    title: Phaser.GameObjects.Text
    btns: { rock: Phaser.GameObjects.Text; paper: Phaser.GameObjects.Text; scissors: Phaser.GameObjects.Text }
    hint: Phaser.GameObjects.Text
  }
  private lastRpsChallengeAtByOpponent: Map<string, number> = new Map()

  create() {
    const w = this.scale.width

    // Generate a tiny 8-bit style player texture (16x16) procedurally
    if (!this.textures.exists('player8')) {
      this.textures.generate('player8', {
        pixelWidth: 2,
        data: [
          '................',
          '.....3333.......',
          '....344443......',
          '...34444443.....',
          '..3344444433....',
          '..3344444433....',
          '....355553......',
          '....355553......',
          '....355553......',
          '...33555533.....',
          '..33.5555.33....',
          '..3..5..5..3....',
          '.....5..5.......',
          '....55..55......',
          '...55....55.....',
          '................',
        ],
        // Phaser's Palette type expects a full map; we only use 3/4/5.
        palette: {
          0: '#00000000',
          1: '#00000000',
          2: '#00000000',
          3: '#e91e63', // main
          4: '#ff74b4', // highlight
          5: '#222222', // details
          6: '#00000000',
          7: '#00000000',
          8: '#00000000',
          9: '#00000000',
          A: '#00000000',
          B: '#00000000',
          C: '#00000000',
          D: '#00000000',
          E: '#00000000',
          F: '#00000000',
        },
      })
    }

    // Background (simple grass)
    this.add.rectangle(0, 0, 4000, 4000, 0x2ecc71).setOrigin(0)

    // A few obstacles
    const obstacles: Phaser.GameObjects.Rectangle[] = []
    const addRock = (x: number, y: number, ww: number, hh: number) => {
      const r = this.add.rectangle(x, y, ww, hh, 0x7f8c8d).setOrigin(0.5)
      obstacles.push(r)
    }
    addRock(400, 320, 120, 90)
    addRock(700, 520, 200, 60)
    addRock(300, 700, 80, 180)

    const username = window.localStorage.getItem('user') || 'Player'

    const makeActor = (x: number, y: number, name: string): PlayerActor => {
      const sprite = this.add.image(x, y, 'player8').setOrigin(0.5)
      sprite.setScale(1)

      const nameText = this.add
        .text(x, y - 26, name, {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.35)',
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
        })
        .setOrigin(0.5, 1)

      return { sprite, nameText }
    }

    this.player = makeActor(200, 200, username)

    this.connectWs(username)

    // Camera
    this.cameras.main.setBounds(0, 0, 4000, 4000)
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12)

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as unknown as {
      W: Phaser.Input.Keyboard.Key
      A: Phaser.Input.Keyboard.Key
      S: Phaser.Input.Keyboard.Key
      D: Phaser.Input.Keyboard.Key
    }

    // Simple “collision”: keep in bounds + push out of rectangles
    this.events.on('update', () => {
      this.constrainToWorld(this.player.sprite)
      for (const o of obstacles) this.resolveAabb(this.player.sprite, o)

      // Keep name tags above sprites
      this.player.nameText.setPosition(this.player.sprite.x, this.player.sprite.y - 26)
      for (const p of this.othersById.values()) {
        p.nameText.setPosition(p.sprite.x, p.sprite.y - 26)
      }
    })

    const leaveAndClose = () => {
      // User left the route (SPA navigation): leave immediately.
      // Important: give the 'leave' frame a tiny moment to flush before closing.
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'leave' }))
          window.setTimeout(() => {
            try {
              this.ws?.close()
            } catch {
              // ignore
            }
          }, 80)
          return
        }
      } catch {
        // ignore
      }

      try {
        this.ws?.close()
      } catch {
        // ignore
      }
    }

    // Phaser can fire SHUTDOWN or DESTROY depending on how the game is torn down.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, leaveAndClose)
    this.events.once(Phaser.Scenes.Events.DESTROY, leaveAndClose)

    this.createRpsUi()

    // UI hint
    this.add
      .text(w - 16, 16, 'WASD / flèches pour bouger', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
  }

  update(time: number, delta: number) {
    const dt = delta / 1000

    // If we are currently picking RPS, freeze movement (keep it simple).
    const inputLocked = this.rps.status === 'choosing'

    const left = !inputLocked && (this.cursors.left.isDown || this.wasd.A.isDown)
    const right = !inputLocked && (this.cursors.right.isDown || this.wasd.D.isDown)
    const up = !inputLocked && (this.cursors.up.isDown || this.wasd.W.isDown)
    const down = !inputLocked && (this.cursors.down.isDown || this.wasd.S.isDown)

    let vx = 0
    let vy = 0
    if (left) vx -= 1
    if (right) vx += 1
    if (up) vy -= 1
    if (down) vy += 1

    // normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.sqrt(2)
      vx *= inv
      vy *= inv
    }

    const oldX = this.player.sprite.x
    const oldY = this.player.sprite.y

    this.player.sprite.x += vx * this.speed * dt
    this.player.sprite.y += vy * this.speed * dt

    const moved = oldX !== this.player.sprite.x || oldY !== this.player.sprite.y
    if (moved) {
      // Throttle to ~12 updates/sec
      if (time - this.lastSentAt > 80) {
        this.lastSentAt = time
        this.sendPos()
      }
    }

    this.maybeTriggerRps(time)
    this.tickRpsUi(time)
  }

  private constrainToWorld(obj: Phaser.GameObjects.Image) {
    const half = 16
    obj.x = Phaser.Math.Clamp(obj.x, half, 4000 - half)
    obj.y = Phaser.Math.Clamp(obj.y, half, 4000 - half)
  }

  private resolveAabb(a: Phaser.GameObjects.Image, b: Phaser.GameObjects.Rectangle) {
    const ax1 = a.x - a.displayWidth / 2
    const ay1 = a.y - a.displayHeight / 2
    const ax2 = a.x + a.displayWidth / 2
    const ay2 = a.y + a.displayHeight / 2

    const bx1 = b.x - b.width / 2
    const by1 = b.y - b.height / 2
    const bx2 = b.x + b.width / 2
    const by2 = b.y + b.height / 2

    if (ax2 <= bx1 || ax1 >= bx2 || ay2 <= by1 || ay1 >= by2) return

    const overlapX1 = bx2 - ax1
    const overlapX2 = ax2 - bx1
    const overlapY1 = by2 - ay1
    const overlapY2 = ay2 - by1

    const minX = Math.min(overlapX1, overlapX2)
    const minY = Math.min(overlapY1, overlapY2)

    if (minX < minY) {
      if (overlapX1 < overlapX2) a.x += overlapX1
      else a.x -= overlapX2
    } else {
      if (overlapY1 < overlapY2) a.y += overlapY1
      else a.y -= overlapY2
    }
  }

  private connectWs(username: string) {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/ws`

    const ws = new WebSocket(url)
    this.ws = ws

    ws.onopen = () => {
      // Join with current position
      ws.send(
        JSON.stringify({
          type: 'join',
          name: username,
          x: this.player.sprite.x,
          y: this.player.sprite.y,
        }),
      )

      // Heartbeat: keep session alive even when AFK.
      // Also helps the server detect stale tabs that are backgrounded/frozen.
      this.pingTimer = window.setInterval(() => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        } catch {
          // ignore
        }
      }, 2500)

      // Try to close cleanly on navigation/back (BFCache can keep things weird).
      const closeWs = () => {
        try {
          ws.close()
        } catch {
          // ignore
        }
      }
      window.addEventListener('pagehide', closeWs, { once: true })
      window.addEventListener('beforeunload', closeWs, { once: true })
    }

    ws.onmessage = (ev) => {
      let msg: unknown
      try {
        msg = JSON.parse(ev.data)
      } catch {
        return
      }

      const m = msg as { type?: string; [k: string]: unknown }

      switch (m.type) {
        case 'hello':
          // ignore (sessionId)
          break
        case 'you':
          if (typeof m.id === 'string') {
            this.myId = m.id
            // If we rendered ourselves as an "other" before receiving our id (race), clean it up.
            this.removeOther(this.myId)
          }
          break
        case 'snapshot': {
          // Snapshot may arrive before we know our public id. We'll reconcile the whole set.
          const players = (m.players as unknown[] | undefined) ?? []
          if (Array.isArray(players)) {
            this.reconcileSnapshot(players)
          }
          break
        }
        case 'join':
          this.upsertOther(m)
          break
        case 'leave':
          if (typeof m.id === 'string') this.removeOther(m.id)
          break
        case 'pos':
          this.updatePos(m)
          break
        case 'rps_start':
          this.onRpsStart(m)
          break
        case 'rps_result':
          this.onRpsResult(m)
          break
        default:
          break
      }
    }

    ws.onclose = () => {
      if (this.pingTimer) {
        window.clearInterval(this.pingTimer)
        this.pingTimer = undefined
      }
      // Could implement reconnect here.
    }
  }

  private reconcileSnapshot(players: unknown[]) {
    const seen = new Set<string>()

    for (const p of players) {
      const o = p as { id?: unknown }
      if (!o || typeof o.id !== 'string') continue
      seen.add(o.id)
      this.upsertOther(p)
    }

    // If myId is known, ensure we don't render ourselves.
    if (this.myId) {
      this.removeOther(this.myId)
      seen.delete(this.myId)
    }

    // Remove any actors not present in the snapshot (stale/ghost players).
    for (const id of this.othersById.keys()) {
      if (!seen.has(id)) this.removeOther(id)
    }
  }

  private upsertOther(p: unknown) {
    const o = p as { id?: unknown; name?: unknown; x?: unknown; y?: unknown }
    if (!o || typeof o.id !== 'string') return

    if (this.myId && o.id === this.myId) return

    const existing = this.othersById.get(o.id)
    if (existing) {
      if (typeof o.name === 'string') existing.nameText.setText(o.name)
      if (typeof o.x === 'number') existing.sprite.x = o.x
      if (typeof o.y === 'number') existing.sprite.y = o.y
      return
    }

    const name = typeof o.name === 'string' ? o.name : 'Player'
    const x = typeof o.x === 'number' ? o.x : 200
    const y = typeof o.y === 'number' ? o.y : 200

    const sprite = this.add.image(x, y, 'player8').setOrigin(0.5)
    sprite.setTint(0x3498db) // others in blue

    const nameText = this.add
      .text(x, y - 26, name, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
      })
      .setOrigin(0.5, 1)

    this.othersById.set(o.id, { sprite, nameText })
  }

  private updatePos(msg: unknown) {
    const o = msg as { id?: unknown; x?: unknown; y?: unknown }
    if (!o || typeof o.id !== 'string') return
    if (this.myId && o.id === this.myId) return

    const actor = this.othersById.get(o.id)
    if (!actor) return

    if (typeof o.x === 'number') actor.sprite.x = o.x
    if (typeof o.y === 'number') actor.sprite.y = o.y
  }

  private removeOther(id: string) {
    const actor = this.othersById.get(id)
    if (!actor) return
    actor.sprite.destroy()
    actor.nameText.destroy()
    this.othersById.delete(id)
  }

  private sendPos() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(
      JSON.stringify({
        type: 'move',
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      }),
    )
  }

  private maybeTriggerRps(time: number) {
    if (!this.myId) return
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (this.rps.status !== 'idle') return

    // Simple overlap check against other players.
    // Player texture is ~16px wide; use a generous radius.
    const R = 18

    for (const [id, actor] of this.othersById.entries()) {
      const dx = actor.sprite.x - this.player.sprite.x
      const dy = actor.sprite.y - this.player.sprite.y
      if (dx * dx + dy * dy > R * R) continue

      // deterministic initiator to avoid both spamming: lower id initiates
      if (this.myId > id) continue

      const last = this.lastRpsChallengeAtByOpponent.get(id) ?? 0
      if (time - last < 2500) continue
      this.lastRpsChallengeAtByOpponent.set(id, time)

      this.ws.send(
        JSON.stringify({
          type: 'rps_challenge',
          targetId: id,
        }),
      )

      // only challenge one at a time
      break
    }
  }

  private createRpsUi() {
    const w = this.scale.width

    const box = this.add
      .rectangle(w / 2, 70, 520, 110, 0x000000, 0.55)
      .setStrokeStyle(2, 0xff69b4, 0.6)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false)

    const title = this.add
      .text(w / 2, 30, 'Pierre Feuille Ciseaux', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false)

    const mkBtn = (x: number, label: string) =>
      this.add
        .text(x, 70, label, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
          backgroundColor: 'rgba(255,255,255,0.10)',
          padding: { left: 10, right: 10, top: 6, bottom: 6 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true })
        .setVisible(false)

    const rock = mkBtn(w / 2 - 140, '🪨 Pierre')
    const paper = mkBtn(w / 2, '📄 Feuille')
    const scissors = mkBtn(w / 2 + 140, '✂️ Ciseaux')

    const hint = this.add
      .text(w / 2, 108, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.15)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false)

    rock.on('pointerdown', () => this.sendRpsChoice('rock'))
    paper.on('pointerdown', () => this.sendRpsChoice('paper'))
    scissors.on('pointerdown', () => this.sendRpsChoice('scissors'))

    this.rpsUi = { box, title, btns: { rock, paper, scissors }, hint }
  }

  private tickRpsUi(time: number) {
    if (!this.rpsUi) return

    // keep centered on resize
    const w = this.scale.width
    this.rpsUi.box.setPosition(w / 2, 70)
    this.rpsUi.title.setPosition(w / 2, 30)
    this.rpsUi.btns.rock.setPosition(w / 2 - 140, 70)
    this.rpsUi.btns.paper.setPosition(w / 2, 70)
    this.rpsUi.btns.scissors.setPosition(w / 2 + 140, 70)
    this.rpsUi.hint.setPosition(w / 2, 108)

    if (this.rps.status === 'idle') {
      this.setRpsUiVisible(false)
      return
    }

    if (this.rps.status === 'choosing') {
      this.setRpsUiVisible(true)
      this.rpsUi.hint.setText(
        this.rps.sent
          ? `Choix envoyé (${this.rps.sent}). En attente de ${this.rps.opponentName}…`
          : `Touché: ${this.rps.opponentName}. Choisis vite.`,
      )
      return
    }

    if (this.rps.status === 'result') {
      if (time > this.rps.until) {
        this.rps = { status: 'idle' }
        this.setRpsUiVisible(false)
        return
      }
      this.setRpsUiVisible(true)
      this.rpsUi.hint.setText(this.rps.text)
    }
  }

  private setRpsUiVisible(v: boolean) {
    if (!this.rpsUi) return
    this.rpsUi.box.setVisible(v)
    this.rpsUi.title.setVisible(v)
    this.rpsUi.hint.setVisible(v)

    const showBtns = v && this.rps.status === 'choosing' && !this.rps.sent
    this.rpsUi.btns.rock.setVisible(showBtns)
    this.rpsUi.btns.paper.setVisible(showBtns)
    this.rpsUi.btns.scissors.setVisible(showBtns)

    if (showBtns) {
      this.rpsUi.btns.rock.setAlpha(1)
      this.rpsUi.btns.paper.setAlpha(1)
      this.rpsUi.btns.scissors.setAlpha(1)
    } else {
      this.rpsUi.btns.rock.setAlpha(0.55)
      this.rpsUi.btns.paper.setAlpha(0.55)
      this.rpsUi.btns.scissors.setAlpha(0.55)
    }
  }

  private onRpsStart(m: { [k: string]: unknown }) {
    const matchId = typeof m.matchId === 'string' ? m.matchId : ''
    const a = typeof m.a === 'string' ? m.a : ''
    const b = typeof m.b === 'string' ? m.b : ''

    if (!matchId || !this.myId) return
    const opponentId = this.myId === a ? b : this.myId === b ? a : ''
    if (!opponentId) return

    const opponent = this.othersById.get(opponentId)
    const opponentName = opponent ? opponent.nameText.text : 'quelqu’un'

    this.rps = { status: 'choosing', matchId, opponentId, opponentName }
  }

  private onRpsResult(m: { [k: string]: unknown }) {
    if (!this.myId) return

    const winnerId = typeof m.winnerId === 'string' ? m.winnerId : ''
    const aChoice = typeof m.aChoice === 'string' ? m.aChoice : ''
    const bChoice = typeof m.bChoice === 'string' ? m.bChoice : ''

    const oppName = this.rps.status === 'choosing' ? this.rps.opponentName : 'adversaire'

    let text = ''
    if (winnerId === 'draw') text = `Égalité. (${aChoice} vs ${bChoice})`
    else if (winnerId === this.myId) text = `Victoire. Tu as humilié ${oppName}. (${aChoice} vs ${bChoice})`
    else text = `Défaite. ${oppName} te coupe en deux. (${aChoice} vs ${bChoice})`

    this.rps = { status: 'result', text, until: this.time.now + 2200 }
  }

  private sendRpsChoice(choice: RpsChoice) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (this.rps.status !== 'choosing') return
    if (this.rps.sent) return

    this.ws.send(
      JSON.stringify({
        type: 'rps_choice',
        matchId: this.rps.matchId,
        choice,
      }),
    )

    this.rps = { ...this.rps, sent: choice }
  }
}

export function Game2DPage() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  const config = useMemo<Phaser.Types.Core.GameConfig>(
    () => ({
      type: Phaser.AUTO,
      parent: undefined,
      backgroundColor: '#111111',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
      },
      scene: [FarmScene],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
    }),
    [],
  )

  useEffect(() => {
    if (!hostRef.current) return

    const game = new Phaser.Game({ ...config, parent: hostRef.current })

    return () => {
      game.destroy(true)
    }
  }, [config])

  return (
    <div style={{ height: 'calc(100vh - 40px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: '8px 0' }}>Jeu 2D (proto)</h1>
        <Link to="/">← Retour</Link>
      </div>

      <div
        ref={hostRef}
        style={{
          height: 'calc(100vh - 110px)',
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          border: '2px solid #ff69b4',
          background: '#111',
        }}
      />

      <p style={{ opacity: 0.8, marginTop: 10 }}>
        MVP: déplacement top‑down, caméra, obstacles. Prochaine étape: tileset + sprite + collisions tuiles.
      </p>
    </div>
  )
}
