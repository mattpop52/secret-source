"use client";

import { useEffect, useRef } from "react";

/*
 * The landing card's paint.
 *
 * Cartoon forms, rendered for real. The silhouette is drawn the way a cartoon
 * draws paint — four bold corner masses of two or three fat lobes each, and
 * runs that taper to a heavy round bead — but nothing about it is filled flat.
 * It is a signed distance field shaded per pixel as a thick glossy body: a
 * circular cross-section that rolls over hard at the rim, a microfacet
 * highlight, a small studio to reflect, a warm bounce off the page, light
 * carrying through where the film thins, and a contact shadow cast on the
 * card underneath.
 *
 * The shading is what makes it paint rather than an orange shape, so it is
 * worth being precise about the parts:
 *
 *   - The rim roll. A flat fill with a soft edge reads as a sticker at any
 *     size. A body whose surface turns to face sideways within a few pixels
 *     of its outline reads as something with volume, because that is what
 *     every real edge does.
 *   - A second, far broader arc over the whole body, because a mass wider
 *     than the rim roll would otherwise be a flat field of colour with a lit
 *     edge, and a rim alone outlines a form rather than describing it.
 *   - Reflection. The difference between wet paint and coloured plastic is
 *     almost entirely what the surface picks up from around it, so there is
 *     a small analytic environment — near-black surround, one big soft key
 *     above and left with a tight kicker inside it, warm bounce below.
 *   - The contact shadow. Paint sitting on a page with nothing underneath it
 *     is the clearest tell of a pasted-on shape.
 *
 * Everything is computed in units of the master scale rather than pixels, so
 * the intermediate magnitudes stay near 1 and the field is safe on GPUs whose
 * fragment precision is only mediump.
 */

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;    /* drawing buffer, px */
uniform float uTime;   /* seconds since mount */
uniform float uScale;  /* the paint's master scale, px */
uniform float uFlood;  /* 0 while the card is up, 1 once it has flooded */

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
/* Two octaves is all a normal perturbation can show; a third only costs. */
float ripple(vec2 p){
  return 0.66 * vnoise(p) + 0.34 * vnoise(p * 2.03);
}

float smin(float a, float b, float k){
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float dot2(vec2 v){ return dot(v, v); }
float sdCircle(vec2 p, vec2 c, float r){ return length(p - c) - r; }

/* A cone with round caps: the shape a run of paint makes as it thins. */
float sdRoundCone(vec2 p, vec2 a, vec2 b, float r1, float r2){
  vec2  ba = b - a;
  float l2 = dot(ba, ba);
  float rr = r1 - r2;
  float a2 = l2 - rr * rr;
  float il2 = 1.0 / l2;
  vec2  pa = p - a;
  float y = dot(pa, ba);
  float z = y - l2;
  float x2 = dot2(pa * l2 - ba * y);
  float y2 = y * y * l2;
  float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

/* Paint that has run a long way is still creeping: most of the distance
   early, then a tail that never quite stops. */
float ease(float x){ return 1.0 - pow(1.0 - clamp(x, 0.0, 1.0), 2.8); }

/* A run, and the drops it lets go of.

   A rivulet of something thick does not keep travelling: it reaches the
   length where the weight hanging off the end balances what is holding it
   up, and it stops there. What carries on down the page after that is the
   drops. So the run arrives once, slowly, and then holds at its own height —
   each one different — while the tip gathers weight, lets go, and gathers
   again. Nothing is ever drawn back up, and nothing is ever reset: the only
   thing that repeats is the falling.

   The drop is computed here rather than as its own shape so that it shares
   the run's bound on x. Both are narrow and both hang off the same column,
   so one test keeps every pixel outside that column from paying for either. */
float runSdf(vec2 q, float x, float y0, float tip, float w0, float w1,
             float t0, float period, float H, float grow){
  if (abs(q.x - x) > 0.5 + grow) return 1e5;

  /* The single slow arrival. Long, because thick sauce takes its time and
     because this is the first thing the card does. */
  float g = ease(clamp((uTime - 0.4) / 7.5, 0.0, 1.0));
  vec2  a = vec2(x, y0);
  vec2  b = vec2(x, y0 + (tip - y0) * g);

  float ph = fract((uTime + t0) / period);
  /* The tip swells until it cannot hold, then pinches off. */
  float swell = smoothstep(0.0, 0.70, ph) * (1.0 - smoothstep(0.70, 0.88, ph));
  float d = smin(sdRoundCone(q, a, b, w0, w1),
                 sdCircle(q, b, w1 * (0.82 + 1.10 * swell)), w1 * 1.2);

  /* And what it let go of, taking the rest of the card at its own pace. */
  if (ph > 0.70) {
    float u = (ph - 0.70) / 0.30;
    float v = u * u;
    float st = 1.0 + v * 3.2;
    vec2  r = (q - vec2(x, b.y + v * (H + 1.2 - b.y))) / vec2(1.0, st);
    d = min(d, (length(r) - w1 * 1.2) / st);
  }
  return d;
}

/* Lobes wider than they are tall, because sauce spreads under its own weight
   rather than holding a ball. Cheap ellipse: unit-circle test in squashed
   space, scaled back by the smaller semi-axis, which under-reads the distance
   slightly and so is safe to feed a smooth minimum. */
float sdLobe(vec2 p, vec2 c, float rx, float ry){
  return (length((p - c) / vec2(rx, ry)) - 1.0) * min(rx, ry);
}

float corner(vec2 q, float k, float a, float b, float c){
  float d = sdLobe(q, vec2(-0.62, -0.58), 1.30, 1.02);
  d = smin(d, sdLobe(q, vec2(0.02,  0.06), a * 1.28, a * 0.82), k);
  d = smin(d, sdLobe(q, vec2(0.68, -0.18), b * 1.30, b * 0.80), k);
  d = smin(d, sdLobe(q, vec2(1.24, -0.44), c * 1.26, c * 0.84), k);
  return d;
}

/* Distance to the paint, in units of the master scale.

   Each corner mass is skipped outright for pixels it cannot reach, and each
   run is skipped for every column it does not fall down. A fragment is near
   at most one corner and at most one or two runs, so this is close to a
   four-fold saving on the part of the shader that dominates the frame, and
   the branches are coherent across a warp because the regions are large and
   contiguous. The bounds carry enough slack for the contact shadow, which is
   sampled at an offset, and they grow with the flood. */
float paintSdf(vec2 P){
  float W = uRes.x / uScale;
  float H = uRes.y / uScale;
  float k = 0.21;
  float grow = uFlood * uFlood * (W + H);
  float d = 1e5;

  vec2 tl = P;
  vec2 tr = vec2(W - P.x, P.y);
  vec2 bl = vec2(P.x, H - P.y);
  vec2 br = vec2(W - P.x, H - P.y);

  /* The four masses, which sit still: sauce that has arrived and settled. */
  if (tl.x < 2.0 + grow && tl.y < 1.5 + grow) {
    d = corner(tl, k, 0.62, 0.46, 0.33);
  }
  if (tr.x < 2.0 + grow && tr.y < 1.4 + grow) {
    d = min(d, corner(tr, k, 0.54, 0.40, 0.28));
  }
  /* Sauce cannot run upward, so nothing hangs off the bottom two: they only
     sit and catch what comes down. */
  if (bl.x < 2.0 + grow && bl.y < 1.3 + grow) {
    d = min(d, corner(bl, k, 0.50, 0.37, 0.26));
  }
  if (br.x < 2.0 + grow && br.y < 1.3 + grow) {
    d = min(d, corner(br, k, 0.58, 0.43, 0.30));
  }

  /* The runs. Each crosses the whole card and leaves it, on its own period so
     they never fall into step, and each starts inside the lobe that feeds it
     so the join cannot show. */
  /* Each stops at its own height, all of them inside the upper half, so the
     card reads as five separate runs rather than one repeated one — and the
     wordmark keeps the room below them. Held off the left and right edges
     too: a run at x near zero is a stripe down the side of the card, and
     that reads as a border rather than as something falling. */
  d = smin(d, runSdf(tl, 0.26,  0.48, H * 0.50, 0.125, 0.058, 0.00, 11.5, H, grow), 0.12);
  d = smin(d, runSdf(tl, 0.86,  0.16, H * 0.34, 0.094, 0.045, 4.30, 13.1, H, grow), 0.10);
  d = smin(d, runSdf(tl, 1.30, -0.18, H * 0.25, 0.068, 0.034, 8.10,  9.7, H, grow), 0.08);
  d = smin(d, runSdf(tr, 0.28,  0.38, H * 0.44, 0.108, 0.050, 2.20, 12.3, H, grow), 0.11);
  d = smin(d, runSdf(tr, 0.84,  0.04, H * 0.29, 0.076, 0.036, 6.40, 10.6, H, grow), 0.09);

  /* The exit: every surface swells until the card is one sheet of sauce. */
  return d - grow;
}

/* A studio for the paint to reflect. Linear values throughout. */
vec3 env(vec3 r){
  vec3  q = vec3(r.x, -r.y, r.z);
  float up = q.y;
  vec3 c = mix(vec3(0.0015), vec3(0.020, 0.019, 0.018), smoothstep(-1.0, 0.8, up));
  vec3 key = normalize(vec3(-0.40, 1.0, 0.55));
  float k = max(dot(normalize(q), key), 0.0);
  c += vec3(1.00, 0.96, 0.90) * pow(k, 2.6) * 1.05;
  c += vec3(1.00, 0.98, 0.95) * pow(k, 44.0) * 2.4;
  /* The page under the card is warm, and thick gloss picks that up. */
  c += vec3(0.42, 0.17, 0.03) * smoothstep(0.25, -0.9, up) * 0.55;
  return c;
}

float ggx(vec3 n, vec3 v, vec3 l, float rough){
  vec3  h = normalize(v + l);
  float a = rough * rough;
  float nh = max(dot(n, h), 0.0);
  float dn = nh * nh * (a * a - 1.0) + 1.0;
  return (a * a / (3.14159 * dn * dn)) * max(dot(n, l), 0.0);
}

void main(){
  vec2 P = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  float px = 1.0 / uScale;               /* one device pixel, in scale units */

  float d = paintSdf(P);

  /* The shadow reaches further than the paint, so the early-out has to clear
     it too — paint sitting on a page with nothing underneath it is the
     clearest tell of a pasted-on shape. But the shadow is the field sampled
     at an offset no longer than half its own reach, so one evaluation is
     enough to rule the whole far field out, and that is what keeps the empty
     three quarters of the card down to a single evaluation per pixel. */
  float SH = 0.15;
  if (d > 1.5 * SH) discard;

  float cov = smoothstep(1.1 * px, -1.1 * px, d);

  /* Under opaque paint the shadow cannot show, so it is not worth sampling. */
  float shade = 0.0;
  if (cov < 0.999) {
    shade = smoothstep(SH, -0.02 * SH, paintSdf(P - vec2(0.28, 0.40) * SH)) * 0.80;
  }

  vec3 col = vec3(0.0);
  if (cov > 0.0015) {
    /* Thickness as a circular cross-section: nearly flat across the body,
       rolling over hard at the rim. */
    float t = clamp(-d / 0.094, 0.0, 1.0);
    float u = 1.0 - t;
    float h = sqrt(max(1.0 - u * u, 0.0));

    /* A second, far broader arc over the whole body — but only just enough
       to keep it from reading as a flat field. Any more and a mass curves
       like something inflated, which is the whole difference between sauce
       lying on a surface and a bubble sitting on one. */
    float ub = 1.0 - clamp(-d / 2.60, 0.0, 1.0);
    float hb = sqrt(max(1.0 - ub * ub, 0.0));

    /* Normal from the height field. Forward differences: two extra field
       evaluations rather than four, which matters because this runs for every
       pixel of the silhouette.

       The step is deliberately several pixels rather than one. A difference
       taken over a single pixel is about the same size as the field's own
       precision, so whatever the hardware rounds off arrives in the normal
       multiplied by the reciprocal of the step — which shows up as contour
       rings banding across every surface, and gets worse on exactly the GPUs
       that can least afford extra work. Taking the step wider costs a little
       crispness at the rim and buys a normal that survives mediump.

       Only the direction is kept: for a true distance field the gradient is
       already unit length, so its magnitude carries no information here and
       normalising throws away the noisiest part of the measurement. */
    float e = max(px * 2.0, 0.032);
    vec2  g = vec2(paintSdf(P + vec2(e, 0.0)) - d,
                   paintSdf(P + vec2(0.0, e)) - d);
    float glen = length(g);
    vec2  dir = glen > 1e-6 ? g / glen : vec2(0.0);
    float slope = min(u / max(h, 0.10), 7.0)
                + min(ub / max(hb, 0.10), 3.0) * 0.12;
    vec3  n = normalize(vec3(dir * slope * 1.25, 1.0));

    /* The gradient falls below unit length inside a blend, which is exactly
       where two bodies have merged: free occlusion in the creases. */
    float ao = mix(0.42, 1.0, clamp(glen / e * 1.05, 0.0, 1.0));

    /* The body is still moving, so the surface is never quite flat. Ripples
       ride down it and drag the highlight with them, and that travelling
       highlight is what the eye reads as wet. */
    /* Drawn out vertically, because it is running: the structure a sauce
       carries is streaks along the direction of flow, not a pebbled surface.
       This is also what breaks the highlight into something that travels,
       instead of one round glint sitting still on a dome. */
    /* Coarse on purpose. Finer than this and the normal varies faster than
       the pixel grid can carry, which does not read as texture — it reads as
       a cross-hatch crawling over the surface, and it gets worse the further
       the resolution controller has had to step down. */
    vec2  fp = P * vec2(1.9, 0.62) + vec2(0.0, -uTime * 0.11);
    float f0 = ripple(fp);
    vec2  fg = vec2(ripple(fp + vec2(0.07, 0.0)) - f0,
                    ripple(fp + vec2(0.0, 0.07)) - f0);
    /* Faded out as the buffer gets coarser. The resolution controller steps
       down on exactly the machines least able to carry fine detail, and a
       normal perturbation the pixel grid cannot resolve does not read as
       texture — it reads as the surface crawling. */
    float fine = clamp(0.0075 / px, 0.0, 1.0);
    n = normalize(n + vec3(fg * vec2(1.4, 0.7) * t * fine, 0.0));

    vec3 V  = vec3(0.0, 0.0, 1.0);
    vec3 L1 = normalize(vec3(-0.46, -0.72, 0.52));
    vec3 L2 = normalize(vec3( 0.76, -0.16, 0.38));

    /* One clean colour: cartoon forms want a flat, confident fill, and the
       shape does the describing. */
    /* Redder and deeper than it was. Golden-amber plus light coming through
       the thin parts is exactly the recipe for honey; sauce is a pigment that
       stops light rather than carrying it. */
    vec3 albedo = pow(vec3(0.745, 0.298, 0.052), vec3(2.2));

    float nl1 = max(dot(n, L1), 0.0);
    float nl2 = max(dot(n, L2), 0.0);

    /* Keep the fill mean so the body has somewhere dark to go: a form lit
       from every side has no shape, and the highlight has nothing to beat. */
    vec3 diff = albedo * (0.055 + 1.80 * nl1) * ao
              + albedo * vec3(1.0, 0.74, 0.50) * 0.22 * nl2;

    /* A trace of light through the very thinnest edge, and no more than a
       trace: a body that glows where it is thin is the single strongest
       honey cue there is. */
    diff += pow(vec3(0.95, 0.30, 0.06), vec3(2.2)) * pow(u, 3.2) * 0.16 * ao;

    float nv = max(dot(n, V), 0.0);
    float fres = 0.035 + 0.965 * pow(1.0 - nv, 5.0);
    /* Held back at grazing angles: with the rim rolled this tightly, a strong
       fresnel puts a hard bright line all the way round every shape, and a
       drawn outline is the one thing that will not read as liquid. */
    vec3 refl = env(reflect(-V, n)) * (0.13 + 0.28 * fres);

    /* Wet, not polished. A tight lobe puts a single round glint on every mass
       and that one detail reads as a balloon no matter what the silhouette is
       doing; a broader one lets the flow structure above shape the highlight
       into streaks, which is what a sauce actually does with a light. */
    /* Wet, but not glassy. A tight lobe over a translucent body is what
       honey looks like; widening it and pulling it down leaves a sheen that
       sits on the surface instead of appearing to come from inside it. */
    /* Softer than a lit sphere wants to be, on purpose. The normal is
       reconstructed by differencing the distance field, so it carries a
       fraction of a degree of uncertainty, and a narrow lobe turns that into
       a shimmer crawling through the bright band. Widening the lobe both
       hides it and is the truer material: sauce has a sheen, not a glint. */
    vec3 spec = vec3(1.0, 0.96, 0.90)
              * (ggx(n, V, L1, 0.215) * 0.52 + ggx(n, V, L2, 0.34) * 0.18);

    /* A rim of the key catching the far shoulder, kept low: a bright outline
       all the way round is the other half of the balloon read. */
    float rim = pow(1.0 - nv, 3.5) * max(dot(n, normalize(vec3(-0.6, -0.75, 0.0))), 0.0);
    spec += vec3(1.0, 0.82, 0.56) * rim * 0.18;

    col = diff + refl + spec;

    /* Roll the highlights off on luminance so the hue survives the clip. A
       per-channel curve turns every hot spot cream, which is exactly what
       makes rendered liquid look like plastic. */
    col *= 1.0 / (1.0 + max(col.r, max(col.g, col.b)) * 0.42);
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  }

  float a = cov + shade * (1.0 - cov);
  gl_FragColor = vec4(col * cov / max(a, 1e-4), a);
}
`;

/** Long enough for the paint to swell past every edge of the card. */
const FLOOD_MS = 560;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function Paint({ leaving }: { leaving: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read inside the frame loop rather than re-running the whole GL setup when
  // the exit starts, which would drop the context mid-animation.
  const leavingRef = useRef(leaving);
  leavingRef.current = leaving;
  // Restarts the loop after it has parked itself. Under reduced motion the
  // card is a single settled frame, so the exit needs a way back in.
  const kickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      // The card is dismissed within a few seconds, so a dropped frame after
      // a resize costs nothing and the driver gets to skip a copy.
      preserveDrawingBuffer: false,
    });

    // No WebGL is not a failure state worth papering over: the card is the
    // ground, the wordmark and the button, and it is complete without paint.
    if (!gl) {
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();

    if (!(vs && fs && program)) {
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is the WebGL call, not a React hook
    gl.useProgram(program);

    // One triangle covering the clip volume — a quad would rasterize the
    // diagonal twice.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uScale = gl.getUniformLocation(program, "uScale");
    const uFlood = gl.getUniformLocation(program, "uFlood");

    let width = 0;
    let height = 0;
    let ratio = 1;

    // Liquid is smooth, so it survives being rendered below the display's own
    // pixel ratio far better than text or hairlines would — and this is a
    // per-pixel shader, so resolution is very nearly the whole frame cost.
    // Which means it is also the honest dial to turn when a machine cannot
    // keep up, rather than guessing at a device class up front.
    let quality = 1;

    const resize = () => {
      const cap = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
      const w = Math.max(1, Math.round(window.innerWidth * cap));
      const h = Math.max(1, Math.round(window.innerHeight * cap));

      if (w === width && h === height) {
        return;
      }

      width = w;
      height = h;
      ratio = cap;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    let floodFrom = 0;
    let raf = 0;

    // Frame cost, sampled in blocks so one slow frame cannot trigger a step.
    let blockStart = 0;
    let blockFrames = 0;
    // The first block pays for shader compilation and the first upload, which
    // is slow on hardware that will then run this at full rate — measuring it
    // would step a fast machine down for something it only does once.
    let warmup = 5;

    const draw = (now: number) => {
      // Step the resolution down if the machine is not keeping up. Only ever
      // down, and only twice: a controller that can also step back up hunts
      // between two states forever on hardware sitting near the threshold.
      if (warmup > 0) {
        warmup--;
      } else {
        blockFrames++;
        if (!blockStart) {
          blockStart = now;
        } else if (now - blockStart >= 250 && blockFrames >= 3) {
          // Blocks are bounded by wall time, not by a frame count: a machine
          // slow enough to need this most is exactly the one that would take
          // many seconds to accumulate a fixed number of frames.
          const mean = (now - blockStart) / blockFrames;
          if (mean > 21 && quality > 0.45) {
            // One step will not rescue something this far over budget.
            quality = Math.max(0.45, quality * (mean > 45 ? 0.5625 : 0.75));
            width = 0;
          }
          blockStart = now;
          blockFrames = 0;
        }
      }

      resize();

      // Settled, not frozen at nothing: reduced motion gets the paint where
      // it ends up, which is the composition the card was designed around.
      const t = reduced.matches ? 9 : (now - start) / 1000;

      if (leavingRef.current && floodFrom === 0) {
        floodFrom = now;
      }
      const flood = floodFrom ? Math.min((now - floodFrom) / FLOOD_MS, 1) : 0;

      const css = width / ratio;
      const scale =
        Math.min(Math.max(132, 0.196 * css), 330, 0.3 * (height / ratio)) *
        ratio;

      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uFlood, flood);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Reduced motion is one settled frame. The exit is still allowed to
      // play — it is the transition the card exists to perform — but once it
      // has covered everything there is nothing left to draw.
      if (reduced.matches && (!leavingRef.current || flood >= 1)) {
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    kickRef.current = kick;
    kick();

    // A backgrounded tab stops firing frames anyway; this makes sure the loop
    // is restarted rather than silently dead when it comes back.
    const onVisibility = () => {
      if (!document.hidden) {
        kick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      kickRef.current = null;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    if (leaving) {
      kickRef.current?.();
    }
  }, [leaving]);

  // No aria-hidden: the canvas has no accessible content to hide, and
  // marking a paintable element hidden is what trips assistive tech up.
  return <canvas className="ss-paint" ref={canvasRef} />;
}
