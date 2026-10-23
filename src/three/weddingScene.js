import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createEnvelope, ENV_W } from './envelope3d.js'
import { loadPhotoPaper } from './paper.js'
import { letterShape } from './letter3d.js'

/**
 * The WebGL layer of the invitation (transparent canvas over the page gradient):
 *  - a paper envelope with a gold wax seal, placed over the CSS envelope's box;
 *    openEnvelope() breaks the seal, lifts the flap and flies the card out;
 *  - gold dust drifting upward, twinkling, with depth;
 *  - petals falling and turning in 3D;
 *  - a burst of gold flakes and petals when the envelope opens.
 */

const FONTS = [
  ['400 64px "Great Vibes"', 'Wael Asmaa'],
  ['700 64px "Aref Ruqaa"', 'وائل أسماء إلى افتح رسالتك'],
  ['500 32px "Cormorant Garamond"', 'Open 11'],
  ['italic 500 32px "Cormorant Garamond"', 'To'],
  ['italic 600 32px "Cormorant Garamond"', 'Open'],
  ['600 64px "Cormorant Garamond"', 'W&A'],
]

function loadFonts() {
  if (!document.fonts?.load) return Promise.resolve()
  // Google Fonts split each face by script, so name the glyphs that are needed.
  const all = Promise.all(FONTS.map(([f, sample]) => document.fonts.load(f, sample).catch(() => null)))
  return Promise.race([all, new Promise((resolve) => setTimeout(resolve, 2500))])
}

const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  linear: (t) => t,
}

const FOV = 40
const CAM_Z = 10

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHalfW;
  uniform float uHalfH;
  uniform float uPush;
  uniform vec2 uOrigin;
  attribute vec4 aSeed;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float z = mix(-8.0, 3.0, aSeed.z);
    float depth = (${CAM_Z.toFixed(1)} - z) / ${CAM_Z.toFixed(1)};
    float rise = mod(aSeed.y * 2.0 + uTime * (0.02 + aSeed.w * 0.03), 2.0) - 1.0;
    vec3 pos = vec3(
      (aSeed.x * 2.0 - 1.0) * uHalfW * depth * 1.1 + sin(uTime * 0.3 + aSeed.w * 30.0) * 0.25,
      rise * uHalfH * depth * 1.15,
      z
    );
    // The opening pushes the dust away from the envelope for a moment.
    vec2 away = pos.xy - uOrigin;
    pos.xy += normalize(away + 0.0001) * uPush * (1.6 / (1.0 + length(away) * 0.35));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = 2.2 + pow(aSeed.w, 5.0) * 16.0;
    gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);
    float edge = smoothstep(1.0, 0.75, abs(rise));
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed.x * 2.0) + aSeed.y * 40.0);
    vAlpha = edge * twinkle;
    vTint = aSeed.x;
  }
`

const dustFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uLight;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = pow(smoothstep(0.5, 0.0, d), 2.0);
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = mix(uGold, uLight, step(0.7, vTint));
    gl_FragColor = vec4(col, (halo * 0.75 + core) * vAlpha);
  }
`

const burstVertex = /* glsl */ `
  uniform float uT;
  uniform vec2 uOrigin;
  uniform float uPixelRatio;
  attribute vec4 aSeed;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float a = aSeed.x * 6.28318;
    float speed = 2.5 + aSeed.y * 6.0;
    vec3 vel = vec3(cos(a) * speed, sin(a) * speed * 0.8 + 3.0, (aSeed.z - 0.3) * 6.0);
    float t = uT * (0.75 + aSeed.w * 0.5);
    vec3 pos = vec3(uOrigin, 0.0) + vel * t * exp(-t * 0.9) * 1.4 + vec3(0.0, -1.6 * t * t, 0.0);
    pos.x += sin(t * 3.0 + aSeed.y * 20.0) * 0.2 * t;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (4.0 + aSeed.z * 9.0) * uPixelRatio * (8.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.08, uT) * (1.0 - smoothstep(1.4, 3.2, t));
    vTint = aSeed.w;
  }
`

const burstFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uLight;
  uniform vec3 uBlush;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    // Small rectangles of foil, softened at the edges.
    float flake = smoothstep(0.5, 0.35, abs(p.x) * 1.6) * smoothstep(0.5, 0.35, abs(p.y));
    vec3 col = vTint < 0.6 ? uGold : (vTint < 0.85 ? uBlush : uLight);
    gl_FragColor = vec4(col, flake * vAlpha);
  }
`

const petalVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSpanY;
  uniform float uHalfW;
  attribute vec4 aSeed;
  varying vec2 vUv;
  varying float vShade;
  varying float vMix;

  mat3 rot(vec3 a) {
    vec3 s = sin(a);
    vec3 c = cos(a);
    mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, c.x, s.x, 0.0, -s.x, c.x);
    mat3 ry = mat3(c.y, 0.0, -s.y, 0.0, 1.0, 0.0, s.y, 0.0, c.y);
    mat3 rz = mat3(c.z, s.z, 0.0, -s.z, c.z, 0.0, 0.0, 0.0, 1.0);
    return rz * ry * rx;
  }

  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += (p.x * p.x) * 2.4 + (p.y * p.y) * 1.2;
    float t = uTime * (0.3 + aSeed.z * 0.35) + aSeed.w * 20.0;
    mat3 r = rot(vec3(t * 0.9 + aSeed.w * 6.0, t * 0.6, t * 0.35 + aSeed.x * 3.0));
    p = r * p;
    vShade = 0.55 + 0.45 * abs((r * vec3(0.0, 0.0, 1.0)).z);
    vMix = fract(aSeed.w * 7.13);

    float fall = mod(uTime * (0.22 + aSeed.z * 0.25) + aSeed.w * uSpanY, uSpanY);
    vec3 base = vec3(aSeed.x * uHalfW, uSpanY * 0.5 - fall, aSeed.y);
    base.x += sin(uTime * 0.5 + aSeed.w * 12.0) * 0.7;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(base + p, 1.0);
  }
`

const petalFragment = /* glsl */ `
  uniform vec3 uPetalA;
  uniform vec3 uPetalB;
  uniform vec3 uLeaf;
  varying vec2 vUv;
  varying float vShade;
  varying float vMix;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float y = vUv.y;
    float w = sin(y * 3.14159) * (0.55 + 0.45 * y);
    float a = smoothstep(0.03, -0.05, abs(p.x) - w);
    if (a < 0.01) discard;
    vec3 col = vMix < 0.5 ? uPetalA : (vMix < 0.82 ? uPetalB : uLeaf);
    col *= (0.78 + 0.22 * y) * vShade;
    gl_FragColor = vec4(col, a * 0.85);
  }
`

function seeds(count, fill) {
  const arr = new Float32Array(count * 4)
  for (let i = 0; i < count; i += 1) fill(arr, i * 4)
  return arr
}

function random4(arr, o) {
  arr[o] = Math.random()
  arr[o + 1] = Math.random()
  arr[o + 2] = Math.random()
  arr[o + 3] = Math.random()
}

function pointsGeometry(count) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds(count, random4), 4))
  return geometry
}

export async function createWeddingScene(canvas, { colors, text, anchor, reducedMotion = false } = {}) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 720
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.autoClear = false
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85

  const scene = new THREE.Scene()
  // Dust and petals live behind; the envelope is drawn over them so nothing passes in front of it.
  const backdrop = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envTarget.texture
  scene.environmentIntensity = 0.22

  // Warm key light from the upper left, a cool fill, and a soft ambient.
  const key = new THREE.DirectionalLight('#ffe9c7', 1.55)
  key.position.set(-6, 3.2, 2.6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 4
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.01
  const fill = new THREE.DirectionalLight('#d9e2ff', 0.25)
  fill.position.set(4, -1, 5)
  scene.add(key, key.target, fill, new THREE.HemisphereLight('#fff3df', '#3b2d1e', 0.3))
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60)
  camera.position.set(0, 0, CAM_Z)

  const view = { w: 1, h: 1, visW: 1, visH: 1 }
  const pixelRatio = { value: renderer.getPixelRatio() }
  const gold = new THREE.Color(colors.gold)
  const light = new THREE.Color(colors.light)
  const blush = new THREE.Color(colors.blush)

  const dustUniforms = {
    uTime: { value: 0 },
    uPixelRatio: pixelRatio,
    uHalfW: { value: 5 },
    uHalfH: { value: 4 },
    uPush: { value: 0 },
    uOrigin: { value: new THREE.Vector2() },
    uGold: { value: gold },
    uLight: { value: light },
  }
  const dust = new THREE.Points(
    pointsGeometry(small ? 700 : 1400),
    new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  dust.frustumCulled = false
  backdrop.add(dust)

  const burstUniforms = {
    uT: { value: 0 },
    uOrigin: dustUniforms.uOrigin,
    uPixelRatio: pixelRatio,
    uGold: { value: gold },
    uLight: { value: light },
    uBlush: { value: blush },
  }
  const burst = new THREE.Points(
    pointsGeometry(small ? 260 : 420),
    new THREE.ShaderMaterial({
      vertexShader: burstVertex,
      fragmentShader: burstFragment,
      uniforms: burstUniforms,
      transparent: true,
      depthWrite: false,
    }),
  )
  burst.frustumCulled = false
  burst.visible = false
  scene.add(burst)

  const plane = new THREE.PlaneGeometry(0.2, 0.28, 4, 6)
  const petalGeometry = new THREE.InstancedBufferGeometry()
  petalGeometry.index = plane.index
  petalGeometry.setAttribute('position', plane.getAttribute('position'))
  petalGeometry.setAttribute('uv', plane.getAttribute('uv'))
  const petalCount = small ? 26 : 46
  petalGeometry.setAttribute(
    'aSeed',
    new THREE.InstancedBufferAttribute(
      seeds(petalCount, (arr, o) => {
        arr[o] = Math.random() * 2.2 - 1.1
        arr[o + 1] = Math.random() * 7 - 6
        arr[o + 2] = Math.random()
        arr[o + 3] = Math.random()
      }),
      4,
    ),
  )
  petalGeometry.instanceCount = petalCount
  const petalUniforms = {
    uTime: { value: 0 },
    uSpanY: { value: 10 },
    uHalfW: { value: 5 },
    uPetalA: { value: blush.clone() },
    uPetalB: { value: new THREE.Color(colors.petal) },
    uLeaf: { value: new THREE.Color(colors.leaf) },
  }
  const petals = new THREE.Mesh(
    petalGeometry,
    new THREE.ShaderMaterial({
      vertexShader: petalVertex,
      fragmentShader: petalFragment,
      uniforms: petalUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  petals.frustumCulled = false
  backdrop.add(petals)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const clock = new THREE.Clock()
  let burstStart = -1

  // Envelope
  const [photo] = await Promise.all([loadPhotoPaper(import.meta.env.BASE_URL), loadFonts()])
  const shape = letterShape()
  const envelope = createEnvelope({ text: { ...text }, small, photo, shape })
  const fly = { k: 0, from: null, to: null }
  scene.add(envelope.root)
  const tweens = []
  let opened = false

  function tween(name, to, start, duration, easing = ease.inOut) {
    tweens.push({ name, from: null, to, start, duration, easing })
  }

  function runTweens(now) {
    for (let i = tweens.length - 1; i >= 0; i -= 1) {
      const t = tweens[i]
      if (now < t.start) continue
      if (t.from === null) t.from = envelope.state[t.name]
      const k = Math.min(1, (now - t.start) / t.duration)
      const value = t.from + (t.to - t.from) * t.easing(k)
      if (t.apply) t.apply(value)
      else envelope.state[t.name] = value
      if (k >= 1) tweens.splice(i, 1)
    }
  }

  /** Map the CSS envelope's box to the 3D envelope's position and scale. */
  function placeEnvelope(now) {
    const el = anchor?.()
    if (!el) return
    const r = el.getBoundingClientRect()
    if (!r.width) return
    const scale = ((r.width / view.w) * view.visW) / ENV_W
    const x = ((r.left + r.width / 2) / view.w - 0.5) * view.visW
    const y = (0.5 - (r.top + r.height / 2) / view.h) * view.visH
    const idle = opened || reducedMotion ? 0 : 1
    envelope.root.scale.setScalar(scale)
    envelope.root.position.set(x, y + Math.sin(now * 1.4) * 0.05 * idle, 0)
    envelope.root.rotation.x = -0.18 + pointer.y * 0.12 + Math.sin(now * 0.9) * 0.03 * idle
    envelope.root.rotation.y = pointer.x * 0.22
    envelope.root.rotation.z = Math.sin(now * 0.7) * 0.015 * idle
    key.target.position.copy(envelope.root.position)
    const cam = key.shadow.camera
    cam.left = -2.4 * scale
    cam.bottom = -2.4 * scale
    cam.right = 2.4 * scale
    cam.top = 2.4 * scale
    cam.near = 0.5
    cam.far = 20
    cam.updateProjectionMatrix()
  }
  let raf = 0
  let running = true

  function layout() {
    view.w = window.innerWidth
    view.h = window.innerHeight
    renderer.setSize(view.w, view.h, false)
    camera.aspect = view.w / view.h
    camera.updateProjectionMatrix()
    view.visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z
    view.visW = view.visH * camera.aspect
    dustUniforms.uHalfW.value = view.visW / 2
    dustUniforms.uHalfH.value = view.visH / 2
    petalUniforms.uHalfW.value = view.visW / 2
    petalUniforms.uSpanY.value = view.visH * 1.3
  }

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const now = clock.getElapsedTime()
    const speed = reducedMotion ? 0.2 : 1
    dustUniforms.uTime.value = now * speed
    petalUniforms.uTime.value = now * speed

    if (burstStart >= 0) {
      const t = now - burstStart
      burstUniforms.uT.value = t
      dustUniforms.uPush.value = Math.sin(Math.min(t / 1.6, 1) * Math.PI) * 1.2
      if (t > 4.5) {
        burst.visible = false
        burstStart = -1
        dustUniforms.uPush.value = 0
      }
    }

    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04
    camera.position.x = pointer.x * 0.35
    camera.position.y = pointer.y * 0.25
    camera.lookAt(0, 0, 0)

    runTweens(now)
    if (envelope.root.visible) {
      envelope.apply()
      placeEnvelope(now)
    }
    if (fly.from) flyLetter()
    renderer.clear()
    renderer.render(backdrop, camera)
    renderer.clearDepth()
    renderer.render(scene, camera)
  }

  function onPointer(e) {
    pointer.tx = (e.clientX / view.w) * 2 - 1
    pointer.ty = -((e.clientY / view.h) * 2 - 1)
  }

  function onVisibility() {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(raf)
    } else if (!running) {
      running = true
      frame()
    }
  }

  window.addEventListener('resize', layout)
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  layout()
  frame()

  /** Where the page's letter will sit: its centre and width in world units at z = 0. */
  function letterTarget() {
    const vw = view.w
    const vh = view.h
    const cy = vw > 860 ? vh / 2 : 68 + (vh - 96) / 2
    const scale = ((shape.targetWidth / vw) * view.visW) / envelope.letter.width
    const centre = new THREE.Vector3(0, (0.5 - cy / vh) * view.visH, 0.2)
    centre.y -= envelope.letter.openCentre.y * scale
    return { position: centre, quaternion: new THREE.Quaternion(), scale }
  }

  function startFly() {
    const g = envelope.letter.group
    scene.attach(g) // keep its place on screen, leave the envelope behind
    envelope.state.flying = true
    fly.from = { position: g.position.clone(), quaternion: g.quaternion.clone(), scale: g.scale.x }
    fly.to = letterTarget()
  }

  function flyLetter() {
    const g = envelope.letter.group
    const k = ease.inOut(Math.min(1, fly.k))
    g.position.lerpVectors(fly.from.position, fly.to.position, k)
    g.quaternion.slerpQuaternions(fly.from.quaternion, fly.to.quaternion, k)
    g.scale.setScalar(fly.from.scale + (fly.to.scale - fly.from.scale) * k)
    envelope.letter.set({
      openTop: envelope.state.openTop,
      openBottom: envelope.state.openBottom,
      lit: envelope.state.lit,
      opacity: envelope.state.letterOpacity,
    })
  }

  function burstAt(clientX, clientY) {
    if (reducedMotion) return
    dustUniforms.uOrigin.value.set(
      (clientX / view.w - 0.5) * view.visW,
      (0.5 - clientY / view.h) * view.visH,
    )
    burstStart = clock.getElapsedTime()
    burst.visible = true
  }

  return {
    /**
     * Lift the flap, draw the folded letter out, unfold it and carry it to where the page's
     * letter appears. Returns the milliseconds until the page's letter should be shown.
     */
    openEnvelope() {
      if (opened) return 0
      opened = true
      if (reducedMotion) {
        envelope.root.visible = false
        return 0
      }
      const t0 = clock.getElapsedTime()
      envelope.sealShadow(true)
      // The seal stays on the flap and lifts with it.
      tween('flap', -Math.PI - 0.12, t0 + 0.1, 1.15)
      // While the flap is edge-on, move its hinge behind the back so the card passes in front.
      tween('flapZ', -0.03, t0 + 0.64, 0.05, ease.linear)
      const tri = shape.panels === 3
      tween('cardRise', 1, t0 + 1.0, 1.0, ease.out)
      tween('drop', 1, t0 + 2.0, 0.9, ease.in)
      tween('openTop', 1, t0 + 2.05, 0.6)
      if (tri) tween('openBottom', 1, t0 + 2.5, 0.55)
      const flyAt = tri ? 2.95 : 2.6
      const flyFor = 0.85
      window.setTimeout(startFly, flyAt * 1000)
      tween('lit', 1, t0 + flyAt, flyFor, ease.inOut)
      const flyStart = t0 + flyAt
      tweens.push({ name: '__fly', from: 0, to: 1, start: flyStart, duration: flyFor, easing: (k) => k, apply: (v) => { fly.k = v } })
      const revealAt = flyAt + flyFor - 0.05
      tween('letterOpacity', 0, t0 + revealAt + 0.25, 0.6, ease.linear)
      const r = anchor?.()?.getBoundingClientRect()
      const bx = r ? r.left + r.width / 2 : view.w / 2
      const by = r ? r.top + r.height * 0.15 : view.h / 2
      window.setTimeout(() => burstAt(bx, by), 1100)
      window.setTimeout(() => {
        envelope.root.visible = false
        envelope.letter.group.visible = false
      }, (revealAt + 1.0) * 1000)
      return revealAt * 1000
    },
    setText(next) {
      envelope.redraw(next)
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      backdrop.traverse((obj) => {
        obj.geometry?.dispose()
        obj.material?.dispose()
      })
      scene.traverse((obj) => {
        obj.geometry?.dispose()
        obj.material?.dispose()
      })
      plane.dispose()
      envTarget.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
