import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import Phaser from 'phaser'

type PlayerActor = {
  sprite: Phaser.GameObjects.Image
  nameText: Phaser.GameObjects.Text
}

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

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        this.ws?.close()
      } catch {
        // ignore
      }
    })

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

    const left = this.cursors.left.isDown || this.wasd.A.isDown
    const right = this.cursors.right.isDown || this.wasd.D.isDown
    const up = this.cursors.up.isDown || this.wasd.W.isDown
    const down = this.cursors.down.isDown || this.wasd.S.isDown

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
        case 'snapshot': {
          const players = (m.players as unknown[] | undefined) ?? []
          if (Array.isArray(players)) {
            for (const p of players) this.upsertOther(p)
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
        default:
          break
      }
    }

    ws.onclose = () => {
      // Could implement reconnect here.
    }
  }

  private upsertOther(p: unknown) {
    const o = p as { id?: unknown; name?: unknown; x?: unknown; y?: unknown }
    if (!o || typeof o.id !== 'string') return

    // Detect our own id by name+position on first snapshot (simple heuristic)
    if (!this.myId && typeof o.name === 'string' && o.name === this.player.nameText.text) {
      const px = typeof o.x === 'number' ? o.x : 0
      const py = typeof o.y === 'number' ? o.y : 0
      const dx = Math.abs(px - this.player.sprite.x)
      const dy = Math.abs(py - this.player.sprite.y)
      if (dx < 1 && dy < 1) this.myId = o.id
    }

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
