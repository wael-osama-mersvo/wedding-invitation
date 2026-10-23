import * as THREE from 'three'
import { paperMaterial } from './paper.js'
import { createLetter } from './letter3d.js'

/**
 * A paper envelope built from flat pieces, with a gold wax seal.
 * It sits exactly where the (invisible) CSS envelope is laid out, so the page's
 * own button and layout keep working; `open()` plays the opening on a timeline.
 */

export const ENV_W = 3.2
export const ENV_H = 2.04

const CARD_W = ENV_W * 0.9
const CARD_H = ENV_H * 0.86
const FLAP_TIP = 0.6 // fraction of the height the top flap reaches down
const Z = { back: 0, card: 0.02, sides: 0.05, bottom: 0.075, flap: 0.11 }
const THICK = 0.012 // paper thickness, so edges catch the light

function canvasTexture(width, height, draw, { color = true } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  if (color) texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Sage liner with a small gold lattice, seen inside the flap and behind the card. */
function linerMaterial() {
  const map = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6f8464'
    ctx.fillRect(0, 0, w, h)
    const step = 46
    for (let y = -step; y < h + step; y += step) {
      for (let x = -step; x < w + step; x += step) {
        const ox = (y / step) % 2 ? step / 2 : 0
        ctx.save()
        ctx.translate(x + ox, y)
        ctx.fillStyle = 'rgba(224, 192, 122, 0.85)'
        ctx.beginPath()
        ctx.moveTo(0, -9)
        ctx.quadraticCurveTo(6, 0, 0, 9)
        ctx.quadraticCurveTo(-6, 0, 0, -9)
        ctx.fill()
        ctx.fillStyle = 'rgba(247, 239, 223, 0.55)'
        ctx.beginPath()
        ctx.arc(step / 2, 0, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
  })
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(1.6, 1.6)
  return new THREE.MeshStandardMaterial({ map, roughness: 0.75, metalness: 0.05, side: THREE.DoubleSide })
}

const PILLOW = 0.075 // how far the card inside pushes the front out at the centre

/** Bulge of the front at body point (x, y): highest in the middle, flat at the edges. */
function pillow(x, y) {
  const u = Math.max(0, 1 - (x / (ENV_W / 2)) ** 2)
  const v = Math.max(0, 1 - (y / (ENV_H / 2)) ** 2)
  return PILLOW * Math.pow(u, 1.3) * Math.pow(v, 1.3)
}

/** Polygon (body coordinates) to canvas coordinates of a full-envelope texture. */
function toCanvas([x, y], w, h) {
  return [(x / ENV_W + 0.5) * w, (0.5 - y / ENV_H) * h]
}

/** Trace a polygon with slightly irregular, hand-cut edges. */
function tracePaperEdge(ctx, points, w, h, jitter) {
  ctx.beginPath()
  points.forEach((p, i) => {
    const [x0, y0] = toCanvas(p, w, h)
    const [x1, y1] = toCanvas(points[(i + 1) % points.length], w, h)
    const steps = 48
    for (let s = 0; s < steps; s += 1) {
      const t = s / steps
      const n = Math.sin(t * 37 + i * 11) * 0.5 + Math.sin(t * 91 + i * 5) * 0.3
      const nx = -(y1 - y0)
      const ny = x1 - x0
      const len = Math.hypot(nx, ny) || 1
      const x = x0 + (x1 - x0) * t + (nx / len) * n * jitter
      const y = y0 + (y1 - y0) * t + (ny / len) * n * jitter
      if (i === 0 && s === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
}

function maskTexture(points) {
  return canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#fff'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    tracePaperEdge(ctx, points, w, h, 1.2)
    ctx.fill()
    ctx.stroke()
  }, { color: false })
}

/** A light rim where the paper's cut edge catches the light. */
function edgeOverlay(points) {
  return (ctx, s) => {
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(255, 252, 240, 0.7)'
    ctx.lineWidth = s / 260
    tracePaperEdge(ctx, points, s, s, 1.2)
    ctx.stroke()
    ctx.restore()
  }
}

/**
 * Contact shadow around a piece that lies on top of others: a soft dark halo just
 * outside its edges (the inside cut away), stronger towards the lower right.
 */
function haloCanvas(points) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')
  const passes = [
    // [blur, dx, dy, alpha]
    [16, 5, 7, 0.42],
    [5, 1.5, 2, 0.5],
    [1.5, 0, 0, 0.35],
  ]
  for (const [blur, dx, dy, alpha] of passes) {
    ctx.save()
    ctx.filter = `blur(${blur}px)`
    ctx.translate(dx, dy)
    ctx.fillStyle = `rgba(48, 30, 8, ${alpha})`
    tracePaperEdge(ctx, points, 1024, 1024, 1.2)
    ctx.fill()
    ctx.restore()
  }
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = '#000'
  tracePaperEdge(ctx, points, 1024, 1024, 1.2)
  ctx.fill()
  return canvas
}

/** Draws a halo over a piece's albedo, so the shadow is part of that paper. */
function haloOverlay(halo) {
  return (ctx, s) => ctx.drawImage(halo, 0, 0, s, s)
}

function bothOverlays(...overlays) {
  return (ctx, s) => overlays.forEach((o) => o(ctx, s))
}

/**
 * One piece of the envelope: a finely divided sheet the size of the envelope,
 * cut to `points` by an alpha mask and bent to the pillow so it reads as paper over a card.
 * `hingeY` (for the flap) moves the sheet so its pivot is at that body height.
 */
function paperPiece(points, material, { scale = 1, lift = null, hingeY = 0 } = {}) {
  const geometry = new THREE.PlaneGeometry(ENV_W, ENV_H, 72, 46)
  const pos = geometry.getAttribute('position')
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, pillow(x, y) * scale + (lift ? lift(x, y) : 0))
  }
  if (hingeY) geometry.translate(0, -hingeY, 0)
  geometry.computeVertexNormals()
  material.alphaMap = maskTexture(points)
  material.alphaTest = 0.5
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function waxSeal(initials) {
  const group = new THREE.Group()
  const shape = new THREE.Shape()
  const r = 0.3
  for (let i = 0; i <= 64; i += 1) {
    const a = (i / 64) * Math.PI * 2
    const wobble = 1 + Math.sin(a * 7) * 0.035 + Math.sin(a * 13 + 1.3) * 0.02
    const x = Math.cos(a) * r * wobble
    const y = Math.sin(a) * r * wobble
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  // Deep red wax: soft satin, almost no mirror reflection, so the colour stays saturated.
  const wax = new THREE.MeshPhysicalMaterial({
    color: '#7a0d14',
    metalness: 0,
    roughness: 0.62,
    clearcoat: 0.25,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.12,
  })
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 4, curveSegments: 48 }),
    wax,
  )
  body.castShadow = false
  group.add(body)

  // The pressed face: the letters as a bump map, so the light catches the relief.
  const emboss = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 92px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(initials, w / 2, h / 2 + 4)
  }, { color: false })
  const faceMaterial = wax.clone()
  faceMaterial.bumpMap = emboss
  faceMaterial.bumpScale = 7
  faceMaterial.color.set('#6c0a11')
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.26, 48), faceMaterial)
  face.position.z = 0.071
  group.add(face)
  group.userData.materials = [wax, face.material]
  return group
}

function drawAddress(ctx, w, h, text) {
  ctx.clearRect(0, 0, w, h)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = text.rtl ? 'rtl' : 'ltr'
  ctx.fillStyle = 'rgba(92, 70, 40, 0.92)'
  let ctaY = h * 0.5
  if (text.guest) {
    ctx.font = text.rtl ? '700 40px "Aref Ruqaa", serif' : 'italic 500 40px "Cormorant Garamond", serif'
    ctx.fillText(text.to, w / 2, h * 0.12)
    ctx.font = text.rtl ? '700 88px "Aref Ruqaa", serif' : '400 92px "Great Vibes", cursive'
    ctx.fillText(text.guest, w / 2, h * 0.41)
    ctaY = h * 0.69
  }
  if (text.cta) {
    ctx.fillStyle = 'rgba(138, 18, 25, 0.88)'
    ctx.font = text.rtl ? '700 46px "Aref Ruqaa", serif' : 'italic 600 44px "Cormorant Garamond", serif'
    ctx.fillText(text.cta, w / 2, ctaY)
  }
}

export function createEnvelope({ text, small = false, photo = null, shape }) {
  const size = small ? 1024 : 1536
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  const hw = ENV_W / 2
  const hh = ENV_H / 2
  const flapTipY = hh - ENV_H * FLAP_TIP
  const shapes = {
    left: [[-hw, -hh], [-hw, hh], [0.02, -0.06]],
    right: [[hw, hh], [hw, -hh], [-0.02, -0.06]],
    bottom: [[-hw, -hh], [hw, -hh], [0, ENV_H * 0.08]],
    flap: [[-hw, hh], [hw, hh], [0, flapTipY]],
  }

  // Warm cream stock. Canvas y runs down, so a fold at the top of the envelope is y = 0.
  const flapPaper = paperMaterial('#f0dfba', [0.5, 0.75, 0.5, 0.0], size, edgeOverlay(shapes.flap), photo)
  // The bottom piece lies over both sides: its contact shadow is printed on them.
  const bottomHalo = haloOverlay(haloCanvas(shapes.bottom))
  const leftPaper = paperMaterial('#e9d5ab', [0.5, 0.5, 0.0, 0.5], size, bothOverlays(edgeOverlay(shapes.left), bottomHalo), photo)
  const rightPaper = paperMaterial('#e9d5ab', [0.5, 0.5, 1.0, 0.5], size, bothOverlays(edgeOverlay(shapes.right), bottomHalo), photo)
  const bottomPaper = paperMaterial('#e2cb9c', [0.5, 0.42, 0.5, 1.0], size, edgeOverlay(shapes.bottom), photo)
  const outsideDeep = paperMaterial('#d3b885', null, size, null, photo)
  const liner = linerMaterial()

  const back = new THREE.Mesh(new THREE.PlaneGeometry(ENV_W, ENV_H), liner)
  back.position.z = Z.back
  back.receiveShadow = true
  const backOutside = new THREE.Mesh(new THREE.BoxGeometry(ENV_W, ENV_H, THICK), outsideDeep)
  backOutside.position.z = Z.back - THICK / 2 - 0.002
  backOutside.castShadow = true
  body.add(back, backOutside)

  const shadowTexture = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.filter = `blur(${Math.round(w * 0.045)}px)`
    ctx.fillStyle = 'rgba(8, 4, 0, 0.82)'
    const inset = w * 0.17
    ctx.beginPath()
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, w * 0.03)
    ctx.fill()
  })
  const softShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(ENV_W * 1.5, ENV_H * 1.55),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false }),
  )
  softShadow.position.set(0.14, -0.26, -0.3)
  body.add(softShadow)

  const left = paperPiece(shapes.left, leftPaper)
  left.position.z = Z.sides
  const right = paperPiece(shapes.right, rightPaper)
  right.position.z = Z.sides
  const bottom = paperPiece(shapes.bottom, bottomPaper)
  bottom.position.z = Z.bottom
  body.add(left, right, bottom)

  // The letter, folded, between the back and the front flaps.
  let letterWidth = CARD_W * 0.96
  const foldedAt = (w) => w / shape.aspect / shape.panels
  if (foldedAt(letterWidth) > CARD_H * 0.97) letterWidth = CARD_H * 0.97 * shape.aspect * shape.panels
  const letter = createLetter({ width: letterWidth, aspect: shape.aspect, panels: shape.panels, text, photo })
  const letterY = -ENV_H * 0.04
  const letterRise = hh + letter.foldedHeight / 2 + 0.06 - letterY
  letter.group.position.set(0, letterY, Z.card)
  body.add(letter.group)

  // The guest's name, written on the front.
  const addressTexture = canvasTexture(1024, 300, (ctx, w, h) => drawAddress(ctx, w, h, text))
  const addressY = -ENV_H * 0.378
  const addressGeometry = new THREE.PlaneGeometry(ENV_W * 0.62, ENV_W * 0.62 * (300 / 1024), 24, 8)
  const ap = addressGeometry.getAttribute('position')
  for (let i = 0; i < ap.count; i += 1) ap.setZ(i, pillow(ap.getX(i), ap.getY(i) + addressY))
  addressGeometry.computeVertexNormals()
  const address = new THREE.Mesh(
    addressGeometry,
    new THREE.MeshStandardMaterial({ map: addressTexture, transparent: true, roughness: 0.9 }),
  )
  address.position.set(0, addressY, Z.bottom + 0.004)
  body.add(address)

  // Top flap, hinged on the top edge: paper outside, liner inside.
  const flapPivot = new THREE.Group()
  flapPivot.position.set(0, hh, Z.flap)
  const flapShadowTexture = new THREE.CanvasTexture(haloCanvas(shapes.flap))
  const flapShadowGeometry = new THREE.PlaneGeometry(ENV_W, ENV_H, 72, 46)
  const fp = flapShadowGeometry.getAttribute('position')
  for (let i = 0; i < fp.count; i += 1) fp.setZ(i, pillow(fp.getX(i), fp.getY(i)))
  const flapShadowMaterial = new THREE.MeshBasicMaterial({
    map: flapShadowTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })
  const flapShadow = new THREE.Mesh(flapShadowGeometry, flapShadowMaterial)
  flapShadow.position.z = Z.bottom + 0.012
  body.add(flapShadow)

  const flapLift = (x, y) => 0.035 * ((hh - y) / (ENV_H * FLAP_TIP)) ** 2
  const flapOut = paperPiece(shapes.flap, flapPaper, { lift: flapLift, hingeY: hh })
  const linerInside = liner.clone()
  linerInside.side = THREE.BackSide
  const flapIn = paperPiece(shapes.flap, linerInside, { lift: flapLift, hingeY: hh })
  flapIn.position.z = -0.003
  flapPivot.add(flapOut, flapIn)
  body.add(flapPivot)

  const seal = waxSeal(text.initials)
  const sealY = flapTipY + 0.06
  seal.position.set(0, sealY - hh, pillow(0, sealY) + flapLift(0, sealY) + 0.004)
  flapPivot.add(seal)

  const falling = [back, backOutside, softShadow, left, right, bottom, address, flapShadow, flapPivot]
  for (const m of falling) m.userData.baseY = m.position.y

  // State driven by the timeline.
  const state = {
    flap: 0, // radians
    flapZ: Z.flap,
    cardRise: 0,
    openTop: 0,
    openBottom: 0,
    lit: 0,
    letterOpacity: 1,
    flying: false,
    drop: 0,
  }

  function apply() {
    flapPivot.rotation.x = state.flap
    flapShadowMaterial.opacity = Math.max(0, 1 + state.flap / 1.1)
    flapPivot.position.z = state.flapZ

    if (!state.flying) {
      letter.group.position.y = letterY + state.cardRise * letterRise
      letter.group.position.z = Z.card + state.cardRise * 0.06
    }
    letter.set({ openTop: state.openTop, openBottom: state.openBottom, lit: state.lit, opacity: state.letterOpacity })

    // Everything but the card falls away after the card is out.
    for (const m of falling) m.position.y = m.userData.baseY - state.drop * 6
  }

  function redraw(next) {
    Object.assign(text, next)
    letter.redraw(text)
    drawAddress(addressTexture.image.getContext('2d'), 1024, 300, text)
    addressTexture.needsUpdate = true
  }

  /** The seal throws a shadow only once the envelope is being opened. */
  function sealShadow(on) {
    seal.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = on
    })
  }

  apply()
  return { root, state, apply, redraw, letter, sealShadow }
}
