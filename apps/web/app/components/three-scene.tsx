"use client";

import { useEffect, useRef } from "react";
import type * as ThreeNS from "three";

/**
 * Small decorative three.js scenes.
 *
 * - three is imported lazily so it never blocks first paint.
 * - Rendering pauses while the canvas is off screen.
 * - With prefers-reduced-motion a single still frame is drawn.
 * - Where WebGL is unavailable (old browsers, jsdom tests) nothing renders.
 */

export type SceneVariant = "waves" | "jacket" | "sheet" | "joint";

type Three = typeof ThreeNS;
type V3 = [number, number, number];
type Kit = { dot: ThreeNS.Texture };
type Built = { update: (t: number) => void; hud?: () => string };
type Builder = (THREE: Three, scene: ThreeNS.Scene, camera: ThreeNS.PerspectiveCamera, kit: Kit) => Built;

const BRAND = 0x166533;
const BRIGHT = 0x22c55e;
const AMBER = 0xf59e0b;
const RED = 0xef4444;
const PAPER_LINE = 0xb7c2bb;

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

/** Collects line segments; remembers each segment's midpoint for scan effects. */
class Segs {
  pos: number[] = [];
  mids: V3[] = [];

  add(a: V3, b: V3) {
    this.pos.push(...a, ...b);
    this.mids.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
    return this.mids.length - 1;
  }

  poly(p: V3[], closed = false) {
    for (let i = 0; i < p.length - 1; i++) this.add(p[i], p[i + 1]);
    if (closed && p.length > 2) this.add(p[p.length - 1], p[0]);
  }

  lines(THREE: Three, opts: { color?: number; opacity?: number; vertexColors?: boolean } = {}) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    let col: Float32Array | undefined;
    if (opts.vertexColors) {
      col = new Float32Array(this.pos.length);
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    }
    const mat = new THREE.LineBasicMaterial({
      color: opts.vertexColors ? 0xffffff : (opts.color ?? 0xffffff),
      vertexColors: !!opts.vertexColors,
      transparent: true,
      opacity: opts.opacity ?? 1,
    });
    return { obj: new THREE.LineSegments(geo, mat), geo, col, mat };
  }
}

function paint(col: Float32Array, seg: number, c: ThreeNS.Color) {
  col[seg * 6] = col[seg * 6 + 3] = c.r;
  col[seg * 6 + 1] = col[seg * 6 + 4] = c.g;
  col[seg * 6 + 2] = col[seg * 6 + 5] = c.b;
}

function circle(c: V3, r: number, n: number, plane: "xy" | "xz" = "xy", wobble?: (a: number) => number): V3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (wobble ? wobble(a) : 1);
    return plane === "xy"
      ? [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, c[2]]
      : [c[0] + Math.cos(a) * rr, c[1], c[2] + Math.sin(a) * rr];
  });
}

function points(
  THREE: Three,
  kit: Kit,
  pos: Float32Array,
  opts: { color?: number; size: number; opacity?: number; colors?: Float32Array }
) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (opts.colors) geo.setAttribute("color", new THREE.BufferAttribute(opts.colors, 3));
  const mat = new THREE.PointsMaterial({
    color: opts.colors ? 0xffffff : (opts.color ?? 0xffffff),
    vertexColors: !!opts.colors,
    size: opts.size,
    map: kit.dot,
    transparent: true,
    opacity: opts.opacity ?? 1,
    depthWrite: false,
  });
  return { obj: new THREE.Points(geo, mat), geo, mat };
}

function makeDot(THREE: Three) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.45, "rgba(255,255,255,1)");
    gr.addColorStop(0.7, "rgba(255,255,255,0.35)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------- */
/* Hero: rolling sea surface                                         */
/* ---------------------------------------------------------------- */
const waves: Builder = (THREE, scene, camera, kit) => {
  const cols = 150;
  const rows = 44;
  const gap = 0.32;
  const n = cols * rows;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const p = points(THREE, kit, pos, { size: 0.07, colors: col, opacity: 0.85 });
  scene.add(p.obj);
  camera.position.set(0, 2.4, 8.2);
  camera.lookAt(0, -0.5, 0);

  const deep = new THREE.Color(0xd5e6db);
  const crest = new THREE.Color(BRAND);
  const tmp = new THREE.Color();

  return {
    update(t) {
      let i = 0;
      for (let r = 0; r < rows; r++) {
        const z = (r - rows / 2) * gap;
        const near = r / rows; // 0 far → 1 near
        for (let c = 0; c < cols; c++) {
          const x = (c - cols / 2) * gap;
          const h =
            Math.sin(x * 0.5 + t * 0.7) * 0.22 +
            Math.cos(z * 0.9 + t * 0.55) * 0.15 +
            Math.sin((x * 0.7 + z) * 0.35 - t * 0.45) * 0.14 +
            Math.sin(x * 1.7 + z * 1.3 + t * 1.3) * 0.03;
          pos[i] = x;
          pos[i + 1] = h;
          pos[i + 2] = z;
          tmp.copy(deep).lerp(crest, Math.min(1, Math.max(0, (h + 0.3) / 0.75)) * (0.35 + near * 0.65));
          col[i] = tmp.r;
          col[i + 1] = tmp.g;
          col[i + 2] = tmp.b;
          i += 3;
        }
      }
      p.geo.attributes.position.needsUpdate = true;
      p.geo.attributes.color.needsUpdate = true;
    },
  };
};

/* ---------------------------------------------------------------- */
/* How it works: offshore jacket + topsides, scanned bottom to top   */
/* ---------------------------------------------------------------- */
const jacket: Builder = (THREE, scene, camera, kit) => {
  const S = new Segs();
  const TOP = 7.2;
  const MSL = 6.2;
  const CELLAR = 8.0;
  const MAIN = 9.4;
  const levels = [0, 2.4, 4.8, TOP];
  const half = (y: number) => 3 - (y / TOP) * 1.3;
  const ring = (y: number, h = half(y)): V3[] => [
    [-h, y, -h],
    [h, y, -h],
    [h, y, h],
    [-h, y, h],
  ];
  const flags: { seg: number; color: number; label: string }[] = [];

  // Jacket frames, X-bracing, plan bracing, conductor guide frames
  levels.forEach((y, li) => {
    const c = ring(y);
    S.poly(c, true);
    const pb = S.add(c[0], c[2]);
    if (li < 2) S.add(c[1], c[3]);
    if (li === 2) flags.push({ seg: pb, color: 0xfbbf24, label: "plan brace" });
    const g = 0.55;
    S.poly(
      [
        [-g, y, -g],
        [g, y, -g],
        [g, y, g],
        [-g, y, g],
      ],
      true
    );
    if (li < levels.length - 1) {
      const d = ring(levels[li + 1]);
      for (let k = 0; k < 4; k++) {
        S.add(c[k], d[k]);
        const a = S.add(c[k], d[(k + 1) % 4]);
        const b = S.add(c[(k + 1) % 4], d[k]);
        if (li === 1 && k === 0) flags.push({ seg: a, color: 0xf87171, label: "X-brace" });
        if (li === 0 && k === 2) flags.push({ seg: b, color: 0xfbbf24, label: "X-brace" });
      }
    }
  });

  // Conductors
  for (const x of [-0.28, 0.28]) for (const z of [-0.28, 0.28]) S.add([x, -0.8, z], [x, CELLAR, z]);

  // Piles, pile sleeves and mudmats
  ring(0).forEach(([x, , z]) => {
    const sx = Math.sign(x);
    const sz = Math.sign(z);
    const px = x + sx * 0.45;
    const pz = z + sz * 0.45;
    S.add([px, -1.3, pz], [px, 1.5, pz]);
    S.add([px, 1.3, pz], [sx * half(1.3), 1.3, sz * half(1.3)]);
    S.add([px, 0.25, pz], [sx * half(0.25), 0.25, sz * half(0.25)]);
    S.poly(
      [
        [x - 0.45, 0, z - 0.45],
        [x + 0.45, 0, z - 0.45],
        [x + 0.45, 0, z + 0.45],
        [x - 0.45, 0, z + 0.45],
      ],
      true
    );
  });

  // Riser running up one leg, with a pipeline bend at the seabed
  const rz = (y: number) => -half(y) + 0.7;
  const rx = (y: number) => half(y) + 0.22;
  S.poly([
    [rx(0) + 2.2, 0, rz(0)],
    [rx(0) + 0.5, 0, rz(0)],
    [rx(0), 0.35, rz(0)],
    ...[1.2, 2.4, 3.6, 4.8, 6, TOP].map((y) => [rx(y), y, rz(y)] as V3),
    [rx(TOP), CELLAR, rz(TOP)],
  ]);
  [1.2, 3.6, 6].forEach((y) => S.add([rx(y), y, rz(y)], [half(y), y, rz(y)]));

  // Boat landing on the +z face
  const bl = (y: number) => half(y) + 0.4;
  for (const x of [-0.8, 0.8]) {
    S.add([x, 5.3, bl(5.3)], [x, 7.0, bl(7.0)]);
    S.add([x, 5.6, bl(5.6)], [x, 5.6, half(5.6)]);
    S.add([x, 6.8, bl(6.8)], [x, 6.8, half(6.8)]);
  }
  for (const y of [5.6, 6.0, 6.4, 6.8]) S.add([-0.8, y, bl(y)], [0.8, y, bl(y)]);

  // Topsides: cellar + main deck, deck legs, beams
  const D = 2.6;
  [CELLAR, MAIN].forEach((y) => {
    S.poly(ring(y, D), true);
    for (const x of [-1.3, 0, 1.3]) S.add([x, y, -D], [x, y, D]);
    S.add([-D, y, 0], [D, y, 0]);
  });
  ring(TOP).forEach(([x, , z]) => S.add([x, TOP, z], [x, MAIN, z]));
  ring(CELLAR, D).forEach((c, k) => S.add(c, ring(MAIN, D)[k]));

  // Modules
  const box = (x0: number, z0: number, x1: number, z1: number, y0: number, y1: number) => {
    const b: V3[] = [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
    ];
    const t = b.map(([x, , z]) => [x, y1, z] as V3);
    S.poly(b, true);
    S.poly(t, true);
    b.forEach((pt, i) => S.add(pt, t[i]));
  };
  box(-2.4, -2.4, -0.2, -0.6, MAIN, MAIN + 1.1);
  box(0.2, -2.4, 2.4, -1.0, MAIN, MAIN + 0.8);
  box(-2.4, 0.2, -0.6, 2.4, CELLAR, CELLAR + 0.9);

  // Helideck with "H"
  const hc: V3 = [1.3, MAIN + 1.4, 1.2];
  S.poly(circle(hc, 1.15, 8, "xz"), true);
  for (const [dx, dz] of [
    [-0.7, -0.7],
    [0.7, -0.7],
    [0.7, 0.7],
    [-0.7, 0.7],
  ])
    S.add([hc[0] + dx, hc[1], hc[2] + dz], [hc[0] + dx, MAIN, hc[2] + dz]);
  S.add([hc[0] - 0.3, hc[1], hc[2] - 0.35], [hc[0] - 0.3, hc[1], hc[2] + 0.35]);
  S.add([hc[0] + 0.3, hc[1], hc[2] - 0.35], [hc[0] + 0.3, hc[1], hc[2] + 0.35]);
  S.add([hc[0] - 0.3, hc[1], hc[2]], [hc[0] + 0.3, hc[1], hc[2]]);

  // Pedestal crane
  const ped: V3 = [-1.9, MAIN + 1.3, 1.9];
  const tip: V3 = [-4.2, MAIN + 2.7, 3.6];
  S.add([ped[0], MAIN, ped[2]], ped);
  S.add(ped, tip);
  S.add([ped[0], ped[1] + 0.25, ped[2]], tip);
  S.add(tip, [tip[0], MAIN + 1.0, tip[2]]);

  // Flare boom lattice
  const fa: V3 = [-2.6, MAIN, -2.6];
  const fb: V3 = [-5.0, MAIN + 2.6, -4.2];
  const off: V3 = [0, 0.35, 0];
  const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  S.add(fa, fb);
  S.add(add3(fa, off), add3(fb, off));
  for (let i = 0; i < 7; i++) {
    const a = lerp3(fa, fb, i / 7);
    const b = lerp3(fa, fb, (i + 1) / 7);
    S.add(i % 2 ? a : add3(a, off), i % 2 ? add3(b, off) : b);
  }
  S.add(fb, [fb[0], fb[1] + 0.6, fb[2]]);

  const struct = S.lines(THREE, { vertexColors: true, opacity: 0.95 });
  const group = new THREE.Group();
  group.add(struct.obj);

  // Joints at every frame corner
  const nodePos: number[] = [];
  levels.forEach((y) => ring(y).forEach((v) => nodePos.push(...v)));
  group.add(points(THREE, kit, new Float32Array(nodePos), { color: 0x86efac, size: 0.14, opacity: 0.55 }).obj);

  // Flare flame
  const flame = points(THREE, kit, new Float32Array([fb[0], fb[1] + 0.75, fb[2]]), { color: 0xfb923c, size: 0.6 });
  group.add(flame.obj);

  // Seabed grid
  const bed = new Segs();
  for (const r of [3.4, 4.8, 6.2, 7.6]) bed.poly(circle([0, -0.02, 0], r, 96, "xz"), true);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bed.add([Math.cos(a) * 3.4, -0.02, Math.sin(a) * 3.4], [Math.cos(a) * 7.6, -0.02, Math.sin(a) * 7.6]);
  }
  group.add(bed.lines(THREE, { color: 0x2a4436, opacity: 0.55 }).obj);

  // Sea surface
  const sw = 34;
  const seaPos = new Float32Array(sw * sw * 3);
  const sea = points(THREE, kit, seaPos, { color: 0xbfe8d0, size: 0.06, opacity: 0.22 });
  group.add(sea.obj);

  // Scan plane + outline
  const planeMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), planeMat);
  plane.rotation.x = -Math.PI / 2;
  const outline = new Segs();
  outline.poly(
    [
      [-4.5, 0, -4.5],
      [4.5, 0, -4.5],
      [4.5, 0, 4.5],
      [-4.5, 0, 4.5],
    ],
    true
  );
  const outlineL = outline.lines(THREE, { color: 0x86efac, opacity: 0.4 });
  group.add(plane, outlineL.obj);

  // Finding markers
  const markers = flags.map((f) => {
    const m = struct.geo.attributes.position.array as Float32Array;
    const i = f.seg * 6;
    const mid = new Float32Array([(m[i] + m[i + 3]) / 2, (m[i + 1] + m[i + 4]) / 2, (m[i + 2] + m[i + 5]) / 2]);
    const pt = points(THREE, kit, mid, { color: f.color, size: 0.5, opacity: 0 });
    group.add(pt.obj);
    return { ...f, y: mid[1], mat: pt.mat };
  });

  group.position.y = -5.6;
  scene.add(group);
  scene.fog = new THREE.Fog(0x07120c, 19, 31);
  camera.position.set(0, 2.2, 23.5);
  camera.lookAt(0, -0.4, 0);

  const dim = new THREE.Color(0x2b3d33);
  const done = new THREE.Color(0x4ade80);
  const settled = new THREE.Color(0x3a8f5d);
  const hot = new THREE.Color(0xf0fff4);
  const tmp = new THREE.Color();
  const flagColor = new Map(flags.map((f) => [f.seg, new THREE.Color(f.color)]));
  const H = MAIN + 3.4;
  const total = S.mids.length;
  let hudText = "";

  return {
    update(t) {
      group.rotation.y = 0.5 + t * 0.07;
      const scan = ((t * 1.15) % (H + 4)) - 1.6;
      plane.position.y = scan;
      outlineL.obj.position.y = scan;
      const show = scan > -1.2 && scan < H ? 1 : 0;
      planeMat.opacity = 0.08 * show;
      outlineL.mat.opacity = 0.5 * show;

      let checked = 0;
      S.mids.forEach((m, i) => {
        const d = scan - m[1];
        if (d > 0) checked++;
        const fc = flagColor.get(i);
        if (fc && d > 0.35) tmp.copy(fc);
        else if (d > 0.35) tmp.copy(done).lerp(settled, Math.min(1, (d - 0.35) / 2.5));
        else if (d > -0.35) tmp.copy(hot);
        else tmp.copy(dim);
        paint(struct.col!, i, tmp);
      });
      struct.geo.attributes.color.needsUpdate = true;

      let found = 0;
      markers.forEach((mk, i) => {
        const on = scan > mk.y;
        if (on) found++;
        mk.mat.opacity = on ? 0.6 + Math.sin(t * 2.5 + i) * 0.25 : 0;
      });

      // Sea surface
      let k = 0;
      for (let r = 0; r < sw; r++) {
        for (let c = 0; c < sw; c++) {
          const x = (c / (sw - 1) - 0.5) * 12;
          const z = (r / (sw - 1) - 0.5) * 12;
          seaPos[k++] = x;
          seaPos[k++] = MSL + Math.sin(x * 0.8 + t) * 0.08 + Math.cos(z * 0.7 + t * 0.8) * 0.08;
          seaPos[k++] = z;
        }
      }
      sea.geo.attributes.position.needsUpdate = true;

      flame.mat.size = 0.5 + Math.sin(t * 9) * 0.1 + Math.sin(t * 23) * 0.06;

      const el = Math.max(-62, Math.min(48, (scan - MSL) * 10));
      hudText = `EL ${el >= 0 ? "+" : "−"}${Math.abs(el).toFixed(1)} m  ·  ${Math.min(checked, total)}/${total} members  ·  ${found} flagged`;
    },
    hud: () => hudText,
  };
};

/* ---------------------------------------------------------------- */
/* Pillar 1: drawing sheet, scan bar, revision clouds                */
/* ---------------------------------------------------------------- */
const sheet: Builder = (THREE, scene, camera) => {
  const S = new Segs();
  const W = 2.4;
  const H = 1.6;
  const m = 0.08;
  const rect = (x0: number, y0: number, x1: number, y1: number, s = S) =>
    s.poly(
      [
        [x0, y0, 0],
        [x1, y0, 0],
        [x1, y1, 0],
        [x0, y1, 0],
      ],
      true
    );

  rect(-W, -H, W, H);
  rect(-W + m, -H + m, W - m, H - m);

  // Truss elevation
  const xs = [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8];
  const yb = -0.2;
  const yt = 0.8;
  S.add([xs[0], yb, 0], [xs[6], yb, 0]);
  S.add([xs[0], yt, 0], [xs[6], yt, 0]);
  xs.forEach((x, i) => {
    S.add([x, yb, 0], [x, yt, 0]);
    if (i < 6) {
      const up = i % 2 === 0;
      S.add([x, up ? yb : yt, 0], [xs[i + 1], up ? yt : yb, 0]);
    }
    S.add([x - 0.05, yb - 0.035, 0], [x + 0.05, yb - 0.035, 0]);
    S.add([x - 0.05, yt + 0.035, 0], [x + 0.05, yt + 0.035, 0]);
  });
  [xs[0], xs[6]].forEach((x) =>
    S.poly(
      [
        [x, yb - 0.04, 0],
        [x - 0.1, yb - 0.2, 0],
        [x + 0.1, yb - 0.2, 0],
      ],
      true
    )
  );

  // Grid bubbles
  [xs[0], xs[3], xs[6]].forEach((x) => {
    S.poly(circle([x, 1.3, 0], 0.1, 18), true);
    S.add([x, 1.2, 0], [x, yt + 0.1, 0]);
  });

  // Dimension chain
  const yd = -0.45;
  S.add([xs[0], yd, 0], [xs[6], yd, 0]);
  xs.forEach((x) => S.add([x - 0.04, yd - 0.04, 0], [x + 0.04, yd + 0.04, 0]));
  S.add([xs[0], yb - 0.24, 0], [xs[0], yd - 0.06, 0]);
  S.add([xs[6], yb - 0.24, 0], [xs[6], yd - 0.06, 0]);
  for (let i = 0; i < 6; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    S.add([cx - 0.1, yd + 0.07, 0], [cx + 0.1, yd + 0.07, 0]);
  }

  // Detail callout
  S.poly(circle([-1.2, yb, 0], 0.17, 20), true);
  S.add([-1.32, yb - 0.12, 0], [-1.6, -0.6, 0]);
  S.poly(circle([-1.68, -0.6, 0], 0.08, 14), true);

  // General notes
  const ny = -0.78;
  S.add([-2.2, ny, 0], [-1.3, ny, 0]);
  [0.9, 1.6, 1.2, 1.8, 0.7].forEach((len, i) => S.add([-2.2, ny - 0.12 * (i + 1), 0], [-2.2 + len, ny - 0.12 * (i + 1), 0]));

  // Title block
  rect(0.9, -1.52, 2.32, -0.8);
  S.add([0.9, -1.0, 0], [2.32, -1.0, 0]);
  S.add([0.9, -1.26, 0], [2.32, -1.26, 0]);
  S.add([1.6, -1.52, 0], [1.6, -1.26, 0]);
  S.add([1.0, -0.9, 0], [2.0, -0.9, 0]);
  S.add([1.0, -1.13, 0], [1.7, -1.13, 0]);
  S.add([1.0, -1.39, 0], [1.45, -1.39, 0]);
  S.add([1.7, -1.39, 0], [2.2, -1.39, 0]);

  const base = S.lines(THREE, { vertexColors: true });
  const group = new THREE.Group();
  group.add(base.obj);

  // Revision clouds + leaders + tags (the findings)
  const scallop = (n: number) => (a: number) => 1 + 0.16 * Math.abs(Math.sin((a * n) / 2));
  const issues = [
    { x: 0.6, color: RED, cloud: [0.6, yt, 0.3, 0.2] as const, leader: [0.86, 0.95, 1.12, 1.2] as const, tag: [1.12, 1.12, 1.6, 1.34] as const },
    { x: 1.8, color: AMBER, cloud: [1.8, 0.3, 0.2, 0.36] as const, leader: [1.96, 0.05, 2.08, -0.3] as const, tag: [1.86, -0.52, 2.3, -0.3] as const },
  ].map((iss) => {
    const s = new Segs();
    const [cx, cy, rx, ry] = iss.cloud;
    const pts = circle([0, 0, 0], 1, 72, "xy", scallop(12)).map(([x, y]) => [cx + x * rx, cy + y * ry, 0.01] as V3);
    s.poly(pts, true);
    const [lx0, ly0, lx1, ly1] = iss.leader;
    s.add([lx0, ly0, 0.01], [lx1, ly1, 0.01]);
    const [tx0, ty0, tx1, ty1] = iss.tag;
    rect(tx0, ty0, tx1, ty1, s);
    s.add([tx0 + 0.07, (ty0 + ty1) / 2, 0.01], [tx1 - 0.07, (ty0 + ty1) / 2, 0.01]);
    const l = s.lines(THREE, { color: iss.color, opacity: 0 });
    group.add(l.obj);
    return { x: iss.x, mat: l.mat, obj: l.obj };
  });

  const bar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, H * 2),
    new THREE.MeshBasicMaterial({ color: BRIGHT, transparent: true, opacity: 0.9 })
  );
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, H * 2),
    new THREE.MeshBasicMaterial({ color: BRIGHT, transparent: true, opacity: 0.1, depthWrite: false })
  );
  group.add(glow, bar);

  group.rotation.set(-0.16, 0.18, 0);
  group.position.set(0.18, 0.3, 0); // optically centred, title block clear of the caption
  scene.add(group);
  camera.position.set(0, 0, 6.3);

  // Fit the whole sheet in frame whatever the box's aspect ratio.
  const HALF_W = W + 0.35;
  const HALF_H = H + 0.75;
  const fit = () => {
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.z = Math.max(HALF_H / vt, HALF_W / (vt * camera.aspect));
  };

  const idle = new THREE.Color(PAPER_LINE);
  const done = new THREE.Color(BRAND);
  let found = 0;

  return {
    update(t) {
      fit();
      const cycle = 6.5;
      const p = (t % cycle) / cycle;
      const x = -W + p * 1.3 * W * 2;
      bar.visible = glow.visible = x <= W;
      bar.position.x = Math.min(x, W);
      glow.position.x = Math.min(x, W) - 0.25;
      S.mids.forEach((mid, i) => paint(base.col!, i, mid[0] < x ? done : idle));
      base.geo.attributes.color.needsUpdate = true;
      found = 0;
      issues.forEach((iss) => {
        const since = x - iss.x;
        if (since > 0) found++;
        iss.mat.opacity = since > 0 ? Math.min(1, since * 2.5) : 0;
      });
      group.rotation.y = 0.18 + Math.sin(t * 0.5) * 0.05;
    },
    hud: () => `DWG S-1203 rev C · ${found} finding${found === 1 ? "" : "s"}`,
  };
};

/* ---------------------------------------------------------------- */
/* Pillar 2: tubular KT-joint with weld-toe hot spots                */
/* ---------------------------------------------------------------- */
const joint: Builder = (THREE, scene, camera) => {
  const group = new THREE.Group();
  const R = 0.68; // joint can outer radius
  const STEEL = new THREE.Color(0xc3ccc7);

  // Lighting (scoped to this scene)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8a83, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdff5e6, 1.1);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  const steel = (vertexColors = false) =>
    new THREE.MeshStandardMaterial({
      color: vertexColors ? 0xffffff : STEEL,
      vertexColors,
      metalness: 0.25,
      roughness: 0.45,
    });
  const bore = new THREE.MeshStandardMaterial({ color: 0x4b5a52, roughness: 0.9, side: THREE.BackSide });
  const weldMat = new THREE.MeshStandardMaterial({ color: 0xe7ece9, metalness: 0.4, roughness: 0.3 });

  /** Open tube with visible wall thickness: outer skin, dark bore and annular end caps. */
  const tube = (r: number, len: number, rs: number, hs: number, outer: ThreeNS.Material, caps: [boolean, boolean]) => {
    const g = new THREE.Group();
    const skin = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, rs, hs, true), outer);
    g.add(skin);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.88, len, rs, 1, true), bore));
    caps.forEach((on, i) => {
      if (!on) return;
      const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.88, r, rs), steel());
      ring.rotation.x = i ? -Math.PI / 2 : Math.PI / 2;
      ring.position.y = i ? len / 2 : -len / 2;
      g.add(ring);
    });
    return { g, skin };
  };

  // Chord stubs either side of the thicker joint can
  for (const sx of [-1, 1]) {
    const { g } = tube(0.6, 1.5, 64, 1, steel(), [sx < 0, sx > 0]);
    g.rotation.z = -Math.PI / 2;
    g.position.x = sx * 2.35;
    group.add(g);
    // Can-to-chord shoulder + circumferential weld
    const shoulder = new THREE.Mesh(new THREE.RingGeometry(0.6, R, 64), steel());
    shoulder.rotation.y = (sx * Math.PI) / 2;
    shoulder.position.x = sx * 1.6;
    group.add(shoulder);
    const cw = new THREE.Mesh(new THREE.TorusGeometry(0.615, 0.022, 8, 96), weldMat);
    cw.rotation.y = Math.PI / 2;
    cw.position.x = sx * 1.6;
    group.add(cw);
  }
  const can = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 3.2, 128, 96, true), steel(true));
  can.rotation.z = -Math.PI / 2;
  group.add(can);

  // Braces: two inclined + one vertical (KT). xc = footprint centre on the can crown.
  const braces = [
    { theta: 0.8, xc: -0.98, r: 0.3 },
    { theta: 0, xc: 0, r: 0.26 },
    { theta: -0.8, xc: 0.98, r: 0.3 },
  ];
  const skins: ThreeNS.Mesh[] = [can];
  const curves: ThreeNS.Vector3[][] = [];
  const NC = 72;

  braces.forEach(({ theta, xc, r }) => {
    const d = new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0);
    const o = new THREE.Vector3(xc + Math.tan(theta) * R, 0, 0); // brace axis meets chord axis
    const u = new THREE.Vector3(0, 0, 1);
    const w = new THREE.Vector3().crossVectors(d, u);

    // Exact brace/chord intersection (saddle curve): the weld toe line
    const curve: ThreeNS.Vector3[] = [];
    for (let i = 0; i < NC; i++) {
      const a = (i / NC) * Math.PI * 2;
      const q = o.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r);
      const s = (Math.sqrt(R * R - q.z * q.z) - q.y) / d.y;
      curve.push(q.addScaledVector(d, s));
    }
    curves.push(curve);

    const len = 2.4;
    const s0 = 0.35;
    const { g, skin } = tube(r, len, 64, 48, steel(true), [false, true]);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    g.position.copy(o).addScaledVector(d, s0 + len / 2);
    group.add(g);
    skins.push(skin);

    // Weld bead following the saddle curve, nudged out of both surfaces
    const bead = curve.map((p) => {
      const n = new THREE.Vector3(0, p.y, p.z).normalize();
      const along = p.clone().sub(o);
      const radial = along.sub(d.clone().multiplyScalar(along.dot(d))).normalize();
      return p.clone().addScaledVector(n, 0.012).addScaledVector(radial, 0.012);
    });
    const path = new THREE.CatmullRomCurve3(bead, true);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(path, 160, 0.035, 10, true), weldMat));
  });

  // Precompute each skin vertex's proximity to the weld toes; the geometry is static.
  group.updateMatrixWorld(true);
  const toGroup = group.matrixWorld.clone().invert();
  type Tap = { v: number; b: number; k: number; wgt: number };
  const fields = skins.map((mesh, mi) => {
    const pos = mesh.geometry.attributes.position as ThreeNS.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    mesh.geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const taps: Tap[] = [];
    const p = new THREE.Vector3();
    const m = mesh.matrixWorld.clone().premultiply(toGroup);
    const fall = mi === 0 ? 0.2 : 0.16;
    for (let v = 0; v < pos.count; v++) {
      p.fromBufferAttribute(pos, v).applyMatrix4(m);
      curves.forEach((c, b) => {
        if (mi > 0 && mi - 1 !== b) return; // a brace only feels its own toe
        let best = Infinity;
        let k = 0;
        for (let i = 0; i < c.length; i++) {
          const dd = p.distanceToSquared(c[i]);
          if (dd < best) {
            best = dd;
            k = i;
          }
        }
        const wgt = Math.exp(-best / (fall * fall));
        if (wgt > 0.015) taps.push({ v, b, k, wgt });
      });
    }
    return { geo: mesh.geometry, col, count: pos.count, taps, s: new Float32Array(pos.count) };
  });

  group.position.y = -0.7;
  scene.add(group);
  camera.position.set(0.4, 1.4, 8.4);
  camera.lookAt(0, 0.1, 0);

  const ramp = [new THREE.Color(0x1f9d55), new THREE.Color(0x84cc16), new THREE.Color(AMBER), new THREE.Color(RED)];
  const tmp = new THREE.Color();
  const BANDS = 9;
  let peak = 0;

  return {
    update(t) {
      group.rotation.y = -0.35 + Math.sin(t * 0.3) * 0.32;
      group.rotation.x = 0.18 + Math.sin(t * 0.37) * 0.05;
      // K braces carry alternating axial load; the vertical brace pulses between them
      const load = braces.map((_, b) => 0.6 + 0.4 * Math.sin(t * 0.8 + b * 2.1));
      peak = 0;
      for (const f of fields) {
        f.s.fill(0);
        for (const { v, b, k, wgt } of f.taps) {
          const a = (k / NC) * Math.PI * 2;
          // Saddle points (a = ±90°) peak; crown toe/heel lower
          const pattern = 0.55 + 0.45 * Math.sin(a) * Math.sin(a);
          f.s[v] = Math.max(f.s[v], wgt * pattern * load[b]);
        }
        for (let v = 0; v < f.count; v++) {
          const s = Math.min(1, f.s[v]);
          peak = Math.max(peak, s);
          if (s < 0.06) tmp.copy(STEEL);
          else {
            const q = Math.ceil(s * BANDS) / BANDS; // contour bands, FEA-style
            const x = q * (ramp.length - 1);
            const i = Math.min(ramp.length - 2, Math.floor(x));
            tmp.copy(ramp[i]).lerp(ramp[i + 1], x - i);
            tmp.lerp(STEEL, Math.max(0, 0.35 - s) * 1.6);
          }
          f.col[v * 3] = tmp.r;
          f.col[v * 3 + 1] = tmp.g;
          f.col[v * 3 + 2] = tmp.b;
        }
        f.geo.attributes.color.needsUpdate = true;
      }
    },
    hud: () => `KT joint · weld-toe hot spots · SCF ${(1.8 + peak * 1.6).toFixed(2)}`,
  };
};

const BUILDERS: Record<SceneVariant, Builder> = { waves, jacket, sheet, joint };

/* ---------------------------------------------------------------- */
/* React wrapper                                                     */
/* ---------------------------------------------------------------- */
export function ThreeScene({
  variant,
  className,
  tone = "light",
}: {
  variant: SceneVariant;
  className?: string;
  tone?: "light" | "dark";
}) {
  const host = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof window === "undefined" || typeof window.WebGLRenderingContext === "undefined") return;

    let cancelled = false;
    let teardown = () => {};

    import("three").then((THREE) => {
      if (cancelled) return;

      let renderer: ThreeNS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // WebGL not available — skip the decoration
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      const kit: Kit = { dot: makeDot(THREE) };
      const built = BUILDERS[variant](THREE, scene, camera, kit);

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();

      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const start = performance.now();
      let visible = true;
      let raf = 0;

      const draw = (t: number) => {
        built.update(t);
        renderer.render(scene, camera);
        if (built.hud && hudRef.current) hudRef.current.textContent = built.hud();
      };

      const frame = () => {
        raf = 0;
        draw((performance.now() - start) / 1000);
        if (visible && !reduced) raf = requestAnimationFrame(frame);
      };

      const ro = new ResizeObserver(() => {
        resize();
        if (reduced || !visible) renderer.render(scene, camera);
      });
      ro.observe(el);

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf && !reduced) raf = requestAnimationFrame(frame);
      });
      io.observe(el);

      if (reduced) draw(7);
      else raf = requestAnimationFrame(frame);

      teardown = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        scene.traverse((obj) => {
          const o = obj as ThreeNS.Mesh;
          o.geometry?.dispose();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        });
        kit.dot.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [variant]);

  return (
    <div className={className} aria-hidden="true">
      <div ref={host} className="absolute inset-0" />
      <div
        ref={hudRef}
        className={`pointer-events-none absolute right-3 bottom-2.5 max-w-[calc(100%-1.5rem)] truncate font-mono text-[10px] tracking-wide empty:hidden ${
          tone === "dark" ? "text-white/45" : "text-muted"
        }`}
      />
    </div>
  );
}
