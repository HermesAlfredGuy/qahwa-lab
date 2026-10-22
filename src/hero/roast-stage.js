// QAHWA LAB — the roast stage.
// One Khawlani bean, lit like a product macro, roasted live by scroll progress (0 -> 1).
// Everything here is procedural: geometry, studio environment, surface grain. No downloads.
import * as THREE from 'three';

/* ---------- value noise ---------- */
function valueNoise(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t) { return t * t * (3 - 2 * t); }
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = smooth(x - xi), yf = smooth(y - yi);
  const a = valueNoise(xi, yi), b = valueNoise(xi + 1, yi);
  const c = valueNoise(xi, yi + 1), d = valueNoise(xi + 1, yi + 1);
  return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf;
}

/* fine parchment grain: drives bump + roughness break-up */
function grainTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * 34, v = (y / size) * 34;
      // three octaves: parchment blotches, wrinkles, pores
      let n = noise2(u, v) * 0.44 + noise2(u * 3.3 + 11, v * 3.3 + 7) * 0.3
        + noise2(u * 12.7 + 31, v * 12.7 + 19) * 0.18
        + noise2(u * 41.3 + 5, v * 41.3 + 2) * 0.08;
      n = Math.min(1, Math.max(0, (n - 0.3) * 2.4));
      const i = (y * size + x) * 4;
      const g = 52 + n * 203;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/* warm mottling: the uneven colour of a bean face */
function mottleTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e6e0d6';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 8 + Math.random() * 46;
    const dark = Math.random() > 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + Math.random() * 0.1;
    g.addColorStop(0, dark ? `rgba(96,72,52,${a})` : `rgba(255,246,225,${a * 0.8})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/* ---------- studio environment, painted into an equirect canvas ---------- */
function studioEnvironment(renderer) {
  const w = 1024, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#40312a');
  base.addColorStop(0.42, '#1c1512');
  base.addColorStop(1, '#070504');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const glow = (x, y, r, col) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col);
    g.addColorStop(0.5, col.replace(/[\d.]+\)$/, '0.16)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };
  glow(268, 118, 150, 'rgba(255,240,222,0.9)');   // key softbox, upper left
  glow(846, 196, 132, 'rgba(255,142,68,0.66)');    // warm rim, right
  glow(660, 66, 92, 'rgba(255,212,176,0.6)');      // kicker
  glow(120, 300, 150, 'rgba(190,170,120,0.12)');   // faint bounce

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return env;
}

/* ---------- the bean: lens profile, S-curved crease, parchment relief ---------- */
function beanGeometry() {
  const g = new THREE.SphereGeometry(1, 176, 128);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const SX = 0.64, SY = 0.99, SZ = 0.46;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const az = v.z;

    // lens profile: the two faces are flatter than a sphere, the rim turns over quickly
    let z = Math.sign(az) * Math.pow(Math.abs(az), 0.62) * SZ;
    let x = v.x * SX;
    let y = v.y * SY;

    const cy = y / SY;                                  // -1..1 along the long axis
    const cx = 0.055 * Math.sin(cy * 3.1) + 0.016 * Math.sin(cy * 7.3 + 1.2);   // the crease is not a straight rule
    const cw = 0.05 + 0.03 * Math.cos(cy * 2.4) + 0.01 * Math.sin(cy * 9.1);
    const depth = 0.152 * (0.84 + 0.24 * Math.cos(cy * 2.9 + 0.7));
    const faceW = Math.pow(Math.abs(az), 2.2);
    const tip = Math.pow(Math.cos(Math.min(1, Math.abs(cy)) * Math.PI * 0.5), 1.05);

    const crease = Math.exp(-Math.pow((x - cx) / cw, 2)) * faceW * tip;
    z -= Math.sign(az || 1) * depth * crease;

    // lips either side of the split
    const lip = Math.exp(-Math.pow((Math.abs(x - cx) - 0.108) / 0.034, 2)) * faceW * tip;
    z += Math.sign(az || 1) * 0.02 * lip;

    // plump shoulders
    const bulge = 1 + 0.05 * Math.exp(-Math.pow(y / 0.6, 2)) * Math.exp(-Math.pow(x / 0.6, 2));
    x *= bulge; z *= bulge;

    // parchment relief, pushed along the surface normal so the rim stays clean
    const n1 = noise2(v.x * 5.4 + 3.1, v.y * 5.4 + 1.7) - 0.5;
    const n2 = noise2(v.x * 15.2 + 9.2, v.y * 15.2 + 4.4) - 0.5;
    const n3 = noise2(v.x * 2.1 + 21, v.y * 2.1 + 13) - 0.5;
    const disp = n1 * 0.012 + n2 * 0.0055 + n3 * 0.014;
    x += v.x * disp; y += v.y * disp; z += v.z * disp;

    pos.setXYZ(i, x, y, z);
    // baked contact shading: the split and its lips read dark even before the light hits them
    const ao = Math.max(0.3, 1 - 0.66 * Math.pow(crease, 0.8) - 0.14 * Math.pow(lip, 0.6));
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = ao;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/* roast curve: colour, gloss, relief by progress */
const ROAST = [
  { t: 0.00, c: '#9ba274', rough: 0.76, coat: 0.02, coatR: 0.6, bump: 0.085, env: 0.45 },  // green, papery
  { t: 0.18, c: '#c2ad82', rough: 0.7, coat: 0.02, coatR: 0.55, bump: 0.075, env: 0.5 },
  { t: 0.40, c: '#b8843f', rough: 0.56, coat: 0.08, coatR: 0.48, bump: 0.055, env: 0.66 },
  { t: 0.62, c: '#8d5027', rough: 0.48, coat: 0.16, coatR: 0.46, bump: 0.026, env: 0.76 },
  { t: 0.80, c: '#5d3220', rough: 0.45, coat: 0.14, coatR: 0.5, bump: 0.028, env: 0.84 },
  { t: 1.00, c: '#2b1a12', rough: 0.4, coat: 0.2, coatR: 0.52, bump: 0.03, env: 0.92 },
];

export function createRoastStage(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const env = studioEnvironment(renderer);
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0, 6);

  const grain = grainTexture(512);
  grain.repeat.set(2.6, 2.6);
  const mottle = mottleTexture(512);
  mottle.repeat.set(1.4, 1.4);

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(ROAST[0].c),
    map: mottle,
    roughness: ROAST[0].rough,
    roughnessMap: grain,
    metalness: 0,
    vertexColors: true,
    clearcoat: ROAST[0].coat,
    clearcoatRoughness: ROAST[0].coatR,
    bumpMap: grain,
    bumpScale: ROAST[0].bump,
    envMapIntensity: ROAST[0].env,
    sheen: 0.25,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color('#d9c9a6'),
  });

  const bean = new THREE.Mesh(beanGeometry(), material);
  bean.rotation.set(-0.2, 0.42, 0.1);
  scene.add(bean);

  // warm halo behind the bean, screen-space so it survives any camera move
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false,
      uniforms: { uColor: { value: new THREE.Color('#8a4520') }, uAlpha: { value: 0.35 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }',
      fragmentShader: `
        varying vec2 vUv; uniform vec3 uColor; uniform float uAlpha;
        void main(){
          vec2 p = vUv - vec2(0.5, 0.5);
          float d = length(p * vec2(1.0, 0.9));
          float a = smoothstep(0.52, 0.02, d);
          gl_FragColor = vec4(uColor, pow(a, 2.6) * uAlpha);
        }`,
    })
  );
  halo.renderOrder = -1;
  halo.frustumCulled = false;
  scene.add(halo);

  const key = new THREE.DirectionalLight('#ffe6cc', 3.0);
  key.position.set(-2.6, 2.8, 3.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#ff9f5c', 3.2);
  rim.position.set(2.8, 0.5, -2.6);
  scene.add(rim);

  const fill = new THREE.DirectionalLight('#ffd2a8', 0.55);
  fill.position.set(0.6, -2.2, 1.6);
  scene.add(fill);

  const hemi = new THREE.HemisphereLight('#4a3526', '#0b0806', 0.55);
  scene.add(hemi);

  /* ---- size: always fit the whole bean, whatever the viewport ---- */
  const BEAN_W = 1.32, BEAN_H = 2.02;
  let baseZ = 6, width = 1, height = 1;

  function fitDistance(fovDeg, aspect) {
    const vf = THREE.MathUtils.degToRad(fovDeg);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
    const zW = (BEAN_W / 0.82) / 2 / Math.tan(hf / 2);   // bean fills ~82% of the width...
    const zH = (BEAN_H / 0.62) / 2 / Math.tan(vf / 2);   // ...but never more than ~62% of the height
    return Math.max(zW, zH);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    width = Math.max(1, r.width);
    height = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.75 ? 34 : 30;
    camera.updateProjectionMatrix();
    baseZ = fitDistance(camera.fov, camera.aspect);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- state ---- */
  const state = { p: 0, spin: 0, visible: true };
  let raf = 0;
  // a virtual clock lets frame-by-frame captures keep the idle spin in sync with video time
  const clock = () => (typeof window !== 'undefined' && window.__roastClock) || performance.now();
  let last = clock();
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();

  function applyRoast(p) {
    let i = 0;
    while (i < ROAST.length - 2 && p > ROAST[i + 1].t) i++;
    const a = ROAST[i], b = ROAST[i + 1];
    const k = THREE.MathUtils.clamp((p - a.t) / (b.t - a.t), 0, 1);
    tmpA.set(a.c); tmpB.set(b.c);
    material.color.copy(tmpA).lerp(tmpB, k);
    material.roughness = THREE.MathUtils.lerp(a.rough, b.rough, k);
    material.clearcoat = THREE.MathUtils.lerp(a.coat, b.coat, k);
    material.clearcoatRoughness = THREE.MathUtils.lerp(a.coatR, b.coatR, k);
    material.bumpScale = THREE.MathUtils.lerp(a.bump, b.bump, k);
    material.envMapIntensity = THREE.MathUtils.lerp(a.env, b.env, k);
    material.sheen = THREE.MathUtils.lerp(0.25, 0.06, k);

    rim.intensity = THREE.MathUtils.lerp(2.4, 4.1, p);
    rim.color.setRGB(1, THREE.MathUtils.lerp(0.64, 0.46, p), THREE.MathUtils.lerp(0.36, 0.24, p));
    key.intensity = THREE.MathUtils.lerp(2.6, 2.7, p);
    halo.material.uniforms.uAlpha.value = THREE.MathUtils.lerp(0.3, 0.55, p);
    halo.material.uniforms.uColor.value.setRGB(
      THREE.MathUtils.lerp(0.32, 0.5, p),
      THREE.MathUtils.lerp(0.28, 0.18, p),
      THREE.MathUtils.lerp(0.11, 0.08, p)
    );
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.08, 1.12, p);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const now = clock();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!state.visible) return;

    const p = state.p;
    state.spin += dt * (0.15 + p * 0.08);

    bean.rotation.y = 0.42 + state.spin + p * 1.65;
    bean.rotation.x = -0.2 + Math.sin(state.spin * 0.5) * 0.08 + p * 0.14;
    bean.rotation.z = 0.1 + Math.sin(state.spin * 0.37) * 0.05;

    camera.position.z = THREE.MathUtils.lerp(baseZ, baseZ * 0.9, Math.pow(p, 0.9));
    camera.position.y = 0.02 + p * 0.04;
    camera.position.x = Math.sin(state.spin * 0.26) * 0.05;
    camera.lookAt(0, 0, 0);

    const drop = Math.max(0, (p - 0.965) / 0.035);
    bean.position.y = -Math.pow(drop, 2) * 1.7;

    applyRoast(p);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }, { rootMargin: '140px' });
  io.observe(canvas);

  return {
    setProgress(p) { state.p = THREE.MathUtils.clamp(p, 0, 1); },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      bean.geometry.dispose();
      material.dispose();
      grain.dispose();
      mottle.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
