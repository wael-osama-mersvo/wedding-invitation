import * as THREE from 'three'

/**
 * Procedural cotton paper: one height field built from layered noise, felted fibres,
 * the fine laid lines of good stationery and a few inclusions. From it come a
 * neutral albedo (tinted per piece), a normal map and a roughness map, so the
 * light picks out the grain as the envelope turns.
 */

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tileable value noise with `period` lattice cells across the texture. */
function valueNoise(size, period, random) {
  const grid = new Float32Array(period * period)
  for (let i = 0; i < grid.length; i += 1) grid[i] = random()
  const out = new Float32Array(size * size)
  const step = period / size
  for (let y = 0; y < size; y += 1) {
    const gy = y * step
    const y0 = Math.floor(gy)
    const ty = gy - y0
    const sy = ty * ty * (3 - 2 * ty)
    const r0 = (y0 % period) * period
    const r1 = ((y0 + 1) % period) * period
    for (let x = 0; x < size; x += 1) {
      const gx = x * step
      const x0 = Math.floor(gx)
      const tx = gx - x0
      const sx = tx * tx * (3 - 2 * tx)
      const c0 = x0 % period
      const c1 = (x0 + 1) % period
      const a = grid[r0 + c0] + (grid[r0 + c1] - grid[r0 + c0]) * sx
      const b = grid[r1 + c0] + (grid[r1 + c1] - grid[r1 + c0]) * sx
      out[y * size + x] = a + (b - a) * sy
    }
  }
  return out
}

function fibres(size, random, { count, rgb, alpha }) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const k = size / 1024
  for (let i = 0; i < count; i += 1) {
    const x = random() * size
    const y = random() * size
    const len = (4 + random() * random() * 46) * k
    const a = random() * Math.PI * 2
    const bend = (random() - 0.5) * len
    ctx.strokeStyle = `rgba(${rgb},${alpha * (0.35 + random() * 0.65)})`
    ctx.lineWidth = (0.35 + random() * 0.8) * k
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 - Math.sin(a) * bend,
      y + Math.sin(a) * len * 0.5 + Math.cos(a) * bend,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    )
    ctx.stroke()
  }
  const data = ctx.getImageData(0, 0, size, size).data
  const out = new Float32Array(size * size)
  for (let i = 0; i < out.length; i += 1) out[i] = data[i * 4 + 3] / 255
  return out
}

/** Bilinear, wrapping sample of a square float field. */
function sample(field, n, x, y) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = x - x0
  const ty = y - y0
  const xa = ((x0 % n) + n) % n
  const ya = ((y0 % n) + n) % n
  const xb = (xa + 1) % n
  const yb = (ya + 1) % n
  const a = field[ya * n + xa] + (field[ya * n + xb] - field[ya * n + xa]) * tx
  const b = field[yb * n + xa] + (field[yb * n + xb] - field[yb * n + xa]) * tx
  return a + (b - a) * ty
}

/**
 * Formation: the cloudy, uneven density of real paper seen against light.
 * Domain-warped noise at a quarter of the resolution, upsampled.
 */
function formation(size, random) {
  const n = Math.max(128, size / 4)
  const base = [
    [valueNoise(n, 5, random), 0.45],
    [valueNoise(n, 11, random), 0.3],
    [valueNoise(n, 23, random), 0.17],
    [valueNoise(n, 47, random), 0.08],
  ]
  const wx = valueNoise(n, 4, random)
  const wy = valueNoise(n, 4, random)
  const low = new Float32Array(n * n)
  const warp = n * 0.09
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const i = y * n + x
      const sx = x + (wx[i] - 0.5) * warp
      const sy = y + (wy[i] - 0.5) * warp
      let v = 0
      for (const [field, amp] of base) v += sample(field, n, sx, sy) * amp
      low[i] = v
    }
  }
  const out = new Float32Array(size * size)
  const scale = n / size
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) out[y * size + x] = sample(low, n, x * scale, y * scale)
  }
  return out
}

let cache = null

export function paperSet(size = 1024) {
  if (cache && cache.size === size) return cache
  const random = rng(20261111)

  const n = size * size
  const cloud = formation(size, random)
  const tooth = valueNoise(size, size / 4, random) // ~4 px grain
  const micro = valueNoise(size, size / 2, random) // ~2 px grain
  const light = fibres(size, random, { count: Math.round(size * 5), rgb: '255,255,255', alpha: 0.4 })
  const dark = fibres(size, random, { count: Math.round(size * 1.2), rgb: '0,0,0', alpha: 0.25 })

  const height = new Float32Array(n)
  for (let i = 0; i < n; i += 1) {
    height[i] = cloud[i] * 0.35 + tooth[i] * 0.3 + micro[i] * 0.16 + light[i] * 0.3 - dark[i] * 0.12
  }
  // Tiny pits in the surface.
  const pits = Math.round(n / 900)
  for (let p = 0; p < pits; p += 1) {
    const i = Math.floor(random() * n)
    height[i] -= 0.18
    if (i + 1 < n) height[i + 1] -= 0.09
  }

  // Albedo: warm white, cloudy formation, pale and dark fibres, a few inclusions.
  const albedo = new ImageData(size, size)
  const a = albedo.data
  for (let i = 0; i < n; i += 1) {
    const v = 0.935
      + (cloud[i] - 0.5) * 0.1
      + (tooth[i] - 0.5) * 0.025
      + light[i] * 0.05
      - dark[i] * 0.07
    a[i * 4] = Math.min(255, 255 * v)
    a[i * 4 + 1] = Math.min(255, 249 * v)
    a[i * 4 + 2] = Math.min(255, 236 * v)
    a[i * 4 + 3] = 255
  }
  const specks = Math.round(size * 0.08)
  for (let s = 0; s < specks; s += 1) {
    const i = Math.floor(random() * n)
    const tone = 0.6 + random() * 0.25
    a[i * 4] *= tone
    a[i * 4 + 1] *= tone
    a[i * 4 + 2] *= tone * 0.92
  }
  const fibre = light

  // Normal and roughness from the height field.
  const normalCanvas = document.createElement('canvas')
  normalCanvas.width = normalCanvas.height = size
  const nctx = normalCanvas.getContext('2d')
  const normal = nctx.createImageData(size, size)
  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = roughCanvas.height = size
  const rctx = roughCanvas.getContext('2d')
  const rough = rctx.createImageData(size, size)
  const strength = 4.5 * (size / 1024)
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size
    const down = ((y + 1) % size) * size
    for (let x = 0; x < size; x += 1) {
      const i = y * size + x
      const l = height[y * size + ((x - 1 + size) % size)]
      const r = height[y * size + ((x + 1) % size)]
      const nx = (l - r) * strength
      const ny = (height[down + x] - height[up + x]) * strength
      const len = Math.hypot(nx, ny, 1)
      normal.data[i * 4] = (nx / len * 0.5 + 0.5) * 255
      normal.data[i * 4 + 1] = (ny / len * 0.5 + 0.5) * 255
      normal.data[i * 4 + 2] = (1 / len * 0.5 + 0.5) * 255
      normal.data[i * 4 + 3] = 255
      const g = 255 * (0.8 + (height[i] - 0.5) * 0.25 - fibre[i] * 0.12)
      rough.data[i * 4] = rough.data[i * 4 + 1] = rough.data[i * 4 + 2] = Math.max(0, Math.min(255, g))
      rough.data[i * 4 + 3] = 255
    }
  }
  nctx.putImageData(normal, 0, 0)
  rctx.putImageData(rough, 0, 0)

  const normalMap = new THREE.CanvasTexture(normalCanvas)
  const roughnessMap = new THREE.CanvasTexture(roughCanvas)
  for (const t of [normalMap, roughnessMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
  }
  cache = { size, albedo, normalMap, roughnessMap }
  return cache
}

/**
 * Adds what makes a real envelope read as paper at a glance: a gentle waviness and
 * slightly rounded outer folds, merged into the scan's fine normals.
 * Coordinates are the envelope's own (u right, v up, 0–1), since one sheet covers it.
 */
function handledNormal(image) {
  const w = image.width
  const h = image.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data

  const height = new Float32Array(w * h)
  for (let y = 0; y < h; y += 1) {
    const v = 1 - y / h
    for (let x = 0; x < w; x += 1) {
      const u = x / w
      // A gentle waviness, the way a sheet never lies perfectly flat.
      let hgt = Math.sin(u * 7.1 + v * 2.3) * 2.5 + Math.sin(v * 9.4 - u * 3.1) * 1.8
      // Outer edges are folds: they roll away slightly.
      const edge = Math.min(u, 1 - u, v, 1 - v)
      hgt -= Math.exp(-edge / 0.012) * 1.6
      height[y * w + x] = hgt
    }
  }

  const k = 4
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x
      const gx = (height[i + 1] - height[i - 1]) * k
      const gy = (height[i - w] - height[i + w]) * k // rows run down, v runs up
      let nx = d[i * 4] / 127.5 - 1 - gx
      let ny = d[i * 4 + 1] / 127.5 - 1 - gy
      let nz = d[i * 4 + 2] / 127.5 - 1
      const len = Math.hypot(nx, ny, nz) || 1
      nx /= len
      ny /= len
      nz /= len
      d[i * 4] = (nx * 0.5 + 0.5) * 255
      d[i * 4 + 1] = (ny * 0.5 + 0.5) * 255
      d[i * 4 + 2] = (nz * 0.5 + 0.5) * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  return texture
}

/**
 * Scanned cotton paper (ambientCG Paper001, CC0): colour, normal and roughness maps
 * from public/textures/paper. Resolves to null if they cannot be loaded, and the
 * procedural set above is used instead.
 */
export async function loadPhotoPaper(baseUrl) {
  const loader = new THREE.TextureLoader()
  const load = (name) => loader.loadAsync(`${baseUrl}textures/paper/${name}`)
  try {
    const [color, normalMap, roughnessMap] = await Promise.all([
      load('color.jpg'),
      load('normal.jpg'),
      load('roughness.jpg'),
    ])
    roughnessMap.anisotropy = 8
    return { image: color.image, normalMap: handledNormal(normalMap.image), roughnessMap }
  } catch {
    return null
  }
}

/**
 * A paper material tinted `tint`. `fold` = [x0, y0, x1, y1] (0–1, y down) shades the
 * piece towards its folded edge so neighbouring flaps read apart.
 */
export function paperMaterial(tint, fold = null, size = 1024, overlay = null, photo = null) {
  const set = photo ? null : paperSet(size)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  // The whole envelope is cut from one sheet: every piece shows its own part of the same scan.
  if (photo) ctx.drawImage(photo.image, 0, 0, size, size)
  else ctx.putImageData(set.albedo, 0, 0)
  if (fold) {
    const s = size
    const g = ctx.createLinearGradient(fold[0] * s, fold[1] * s, fold[2] * s, fold[3] * s)
    g.addColorStop(0, 'rgba(90, 62, 25, 0.24)')
    g.addColorStop(0.3, 'rgba(90, 62, 25, 0.07)')
    g.addColorStop(1, 'rgba(90, 62, 25, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }
  overlay?.(ctx, size)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  return new THREE.MeshPhysicalMaterial({
    map,
    color: new THREE.Color(tint),
    normalMap: photo ? photo.normalMap : set.normalMap,
    normalScale: photo ? new THREE.Vector2(1.25, 1.25) : new THREE.Vector2(0.55, 0.55),
    roughnessMap: photo ? photo.roughnessMap : set.roughnessMap,
    roughness: 1,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color('#fff6e4'),
    side: THREE.DoubleSide,
  })
}
