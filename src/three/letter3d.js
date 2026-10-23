import * as THREE from 'three'

/**
 * The invitation letter itself, folded to fit the envelope: in half (landscape, desktop)
 * or in thirds (portrait, phones), like a real letter. Its inside is drawn on the same
 * paper as the page's letter so the hand-off to the DOM card is seamless; it is not yet
 * signed or sealed (the page does that once the couple have walked in). Its outside
 * carries a small gold monogram.
 *
 * Panels are stacked top to bottom. The base panel stays put; the top panel is hinged on
 * the base's top edge and the bottom one (tri-fold only) on its bottom edge. Folded, both
 * lie in front of the base, the top one outermost.
 */

const PAPER = '#efe1c3'
const GOLD = 'rgba(150, 112, 44, 0.75)'

function sheet(ctx, w, h, photo) {
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, w, h)
  if (photo) {
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(photo.image, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }
  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h) * 0.6)
  glow.addColorStop(0, 'rgba(255, 251, 240, 0.55)')
  glow.addColorStop(1, 'rgba(255, 251, 240, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'multiply'
  const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75)
  edge.addColorStop(0, 'rgba(255, 255, 255, 1)')
  edge.addColorStop(1, 'rgba(205, 180, 140, 1)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

function frame(ctx, w, h) {
  const u = Math.min(w, h)
  const a = u * 0.028
  ctx.strokeStyle = GOLD
  ctx.lineWidth = Math.max(1.5, u * 0.0022)
  ctx.strokeRect(a, a, w - a * 2, h - a * 2)
  ctx.lineWidth = Math.max(1, u * 0.0012)
  ctx.strokeStyle = 'rgba(150, 112, 44, 0.4)'
  const b = a + u * 0.009
  ctx.strokeRect(b, b, w - b * 2, h - b * 2)
  // Corner curls
  ctx.strokeStyle = GOLD
  ctx.lineWidth = Math.max(1.5, u * 0.0022)
  const r = u * 0.04
  for (const [x, y, sx, sy] of [[a, a, 1, 1], [w - a, a, -1, 1], [a, h - a, 1, -1], [w - a, h - a, -1, -1]]) {
    ctx.beginPath()
    ctx.arc(x + sx * r, y + sy * r, r * 0.7, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function goldFill(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, '#5e4413')
  g.addColorStop(0.45, '#8a6a24')
  g.addColorStop(0.75, '#c4a253')
  g.addColorStop(1, '#9a7830')
  return g
}

/** The inside of the letter: a likeness of the page's card at the same proportions. */
function drawInside(ctx, w, h, t, photo) {
  sheet(ctx, w, h, photo)
  frame(ctx, w, h)
  const u = Math.min(w, h)
  const landscape = w > h
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.direction = 'rtl'
  ctx.fillStyle = '#2c2418'
  ctx.font = `${Math.round(u * (landscape ? 0.045 : 0.05))}px "Amiri Quran", "Amiri", serif`
  ctx.fillText(`﴿${t.verse}﴾`, w / 2, h * (landscape ? 0.13 : 0.08), w * 0.86)

  ctx.direction = t.rtl ? 'rtl' : 'ltr'
  const nameSize = Math.round(u * (landscape ? 0.085 : 0.1))
  const nameFont = t.rtl ? `700 ${nameSize}px "Aref Ruqaa", serif` : `600 ${nameSize}px "Cormorant Garamond", serif`
  const cx = landscape ? (t.rtl ? w * 0.72 : w * 0.28) : w / 2
  const ny = landscape ? h * 0.42 : h * 0.28
  const gap = nameSize * 1.2
  ctx.font = nameFont
  ctx.fillStyle = goldFill(ctx, ny - gap, ny + gap)
  ctx.fillText(t.groom, cx, ny - gap * 0.65)
  ctx.fillText(t.bride, cx, ny + gap * 0.65)
  ctx.font = `600 ${Math.round(nameSize * 0.35)}px "Cormorant Garamond", serif`
  ctx.fillText(t.and, cx, ny)
  if (t.greeting) {
    ctx.font = t.rtl ? `700 ${Math.round(nameSize * 0.5)}px "Aref Ruqaa", serif` : `500 ${Math.round(nameSize * 0.5)}px "Cormorant Garamond", serif`
    ctx.fillText(t.greeting, cx, ny + gap * 1.65, landscape ? w * 0.42 : w * 0.8)
  }

  ctx.fillStyle = '#2c2418'
  const dx = landscape ? (t.rtl ? w * 0.28 : w * 0.72) : w / 2
  const dy = landscape ? h * 0.42 : h * 0.6
  const detail = Math.round(u * (landscape ? 0.042 : 0.048))
  ctx.font = t.rtl ? `700 ${detail}px "Aref Ruqaa", serif` : `600 ${detail}px "Cormorant Garamond", serif`
  ctx.fillText(t.date, dx, dy - detail * 1.2, landscape ? w * 0.4 : w * 0.8)
  ctx.fillText(t.venue, dx, dy + detail * 0.4, landscape ? w * 0.4 : w * 0.8)
  if (landscape) {
    ctx.strokeStyle = 'rgba(150, 112, 44, 0.5)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(w / 2, h * 0.27)
    ctx.lineTo(w / 2, h * 0.7)
    ctx.stroke()
  }
}

/** The outside: plain paper, a gold rule, and the monogram on the outermost fold. */
function drawOutside(ctx, w, h, panels, photo) {
  sheet(ctx, w, h, photo)
  const ph = h / panels
  const u = Math.min(w, ph)
  // The top panel is seen through a half turn about its hinge: draw it upside down.
  ctx.save()
  ctx.translate(w / 2, ph / 2)
  ctx.scale(1, -1)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = Math.max(1.5, u * 0.006)
  const iw = w * 0.92
  const ih = ph * 0.84
  ctx.strokeRect(-iw / 2, -ih / 2, iw, ih)
  ctx.fillStyle = goldFill(ctx, -u * 0.12, u * 0.12)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `400 ${Math.round(u * 0.24)}px "Great Vibes", cursive`
  ctx.fillText('W & A', 0, 0)
  ctx.restore()
}

function panelGeometry(width, height, v0, v1) {
  const g = new THREE.PlaneGeometry(width, height, 1, 1)
  const uv = g.getAttribute('uv')
  for (let i = 0; i < uv.count; i += 1) uv.setY(i, v0 + uv.getY(i) * (v1 - v0))
  return g
}

export function createLetter({ width, aspect, panels, text, photo }) {
  const height = width / aspect
  const ph = height / panels
  const texW = aspect >= 1 ? 1600 : 1000
  const texH = Math.round(texW / aspect)

  const insideCanvas = document.createElement('canvas')
  insideCanvas.width = texW
  insideCanvas.height = texH
  drawInside(insideCanvas.getContext('2d'), texW, texH, text, photo)
  const outsideCanvas = document.createElement('canvas')
  outsideCanvas.width = texW
  outsideCanvas.height = texH
  drawOutside(outsideCanvas.getContext('2d'), texW, texH, panels, photo)

  const insideMap = new THREE.CanvasTexture(insideCanvas)
  const outsideMap = new THREE.CanvasTexture(outsideCanvas)
  for (const t of [insideMap, outsideMap]) {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  }
  // Lit like paper while folded; by the time it reaches the page it shows its own colours
  // (emissive, not tone-mapped) so it matches the DOM letter it turns into.
  const common = {
    color: new THREE.Color(1, 1, 1),
    emissive: new THREE.Color(1, 1, 1),
    emissiveIntensity: 0,
    roughness: 0.85,
    normalMap: photo?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.5, 0.5),
    transparent: true,
    toneMapped: false,
  }
  const inside = new THREE.MeshStandardMaterial({ ...common, map: insideMap, emissiveMap: insideMap, side: THREE.FrontSide })
  const outside = new THREE.MeshStandardMaterial({ ...common, map: outsideMap, emissiveMap: outsideMap, side: THREE.BackSide })

  const group = new THREE.Group()
  const baseIndex = 1 // the middle of three, or the lower of two
  const v = (i) => [1 - (i + 1) / panels, 1 - i / panels]

  function panel(i) {
    const g = panelGeometry(width, ph, ...v(i))
    const front = new THREE.Mesh(g, inside)
    const back = new THREE.Mesh(g, outside)
    front.castShadow = true
    back.castShadow = true
    const p = new THREE.Group()
    p.add(front, back)
    return p
  }

  const base = panel(baseIndex)
  group.add(base)

  // Top panel, hinged on the base's top edge; folded down in front (outermost).
  const topHinge = new THREE.Group()
  topHinge.position.set(0, ph / 2, 0.008)
  const top = panel(0)
  top.position.y = ph / 2
  topHinge.add(top)
  group.add(topHinge)

  // Bottom panel (tri-fold), hinged on the base's bottom edge; folded up in front.
  let bottomHinge = null
  if (panels === 3) {
    bottomHinge = new THREE.Group()
    bottomHinge.position.set(0, -ph / 2, 0.004)
    const bottom = panel(2)
    bottom.position.y = -ph / 2
    bottomHinge.add(bottom)
    group.add(bottomHinge)
  }

  /** open: 0 folded … 1 flat, for each hinge; lit: 0 paper-lit … 1 its own colours. */
  function set({ openTop, openBottom, lit, opacity }) {
    topHinge.rotation.x = Math.PI * (1 - openTop)
    topHinge.position.z = 0.008 * (1 - openTop)
    if (bottomHinge) {
      bottomHinge.rotation.x = -Math.PI * (1 - openBottom)
      bottomHinge.position.z = 0.004 * (1 - openBottom)
    }
    for (const m of [inside, outside]) {
      m.color.setScalar(1 - lit)
      m.emissiveIntensity = lit
      m.opacity = opacity
    }
    group.visible = opacity > 0.01
  }

  // Centre of the open sheet relative to the base panel's centre.
  const openCentre = new THREE.Vector3(0, panels === 2 ? ph / 2 : 0, 0)

  function redraw(t) {
    drawInside(insideCanvas.getContext('2d'), texW, texH, t, photo)
    insideMap.needsUpdate = true
  }

  return { group, set, redraw, width, height, foldedHeight: ph, openCentre }
}

/** Letter proportions that match the page's card at the current viewport. */
export function letterShape() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw > 860) return { aspect: 1.6, panels: 2, targetWidth: Math.min(1000, vw - 32) }
  const aspect = Math.min(0.8, Math.max(0.42, (vw - 32) / (vh - 100)))
  return { aspect, panels: 3, targetWidth: vw - 32 }
}
