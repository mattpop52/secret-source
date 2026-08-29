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

/* One run, with the bead of weight that gathers at its front. */
float runSdf(vec2 p, vec2 top, float len, float w0, float w1, float t0, float dur){
  float g = ease((uTime - t0) / dur);
  vec2  end = top + vec2(0.0, max(len * g, w0 * 0.5));
  float body = sdRoundCone(p, top, end, w0, w1);
  /* The bead swells as the run slows: mass arriving faster than it drains. */
  float bead = sdCircle(p, end, w1 * (0.85 + 0.62 * g));
  return smin(body, bead, w1 * 1.1);
}

/* A drop that has let go, accelerating and drawing out as it falls. */
float dropSdf(vec2 p, float x, float y0, float r, float fall, float t0, float period){
  float ph = fract((uTime + t0) / period);
  float v = ph * ph;
  float st = 1.0 + v * 3.4;
  vec2  q = (p - vec2(x, y0 + v * fall)) / vec2(1.0, st);
  return (length(q) - r * smoothstep(0.0, 0.08, ph)) / st;
}

/* Every corner is built the same way in its own frame, with the corner at the
   origin and both axes running inward — one description used four times, so
   the card cannot end up subtly different corner to corner. A slab bled off
   both edges keeps the corner solid and says the paint came from outside the
   card; the lobes inside the frame are what make it a shape rather than a
   fillet, so the blend stays tight enough that each one still reads. */
float corner(vec2 q, float k, float a, float b, float c){
  float d = sdCircle(q, vec2(-0.62, -0.58), 1.15);
  d = smin(d, sdCircle(q, vec2(0.02,  0.10), a), k);
  d = smin(d, sdCircle(q, vec2(0.66, -0.14), b), k);
  d = smin(d, sdCircle(q, vec2(1.22, -0.40), c), k);
  return d;
}

/* Distance to the paint, in units of the master scale.
   Each corner is skipped outright for pixels it cannot reach. A fragment is
   near at most one corner, so this is close to a four-fold saving on the part
   of the shader that dominates the frame, and the branches are coherent
   across a warp because the regions are large and contiguous. The bounds
   carry enough slack for the contact shadow, which is sampled at an offset,
   and they grow with the flood. */
float paintSdf(vec2 P){
  float W = uRes.x / uScale;
  float H = uRes.y / uScale;
  float k = 0.15;
  float grow = uFlood * uFlood * (W + H);
  float d = 1e5;

  vec2 tl = P;
  if (tl.x < 2.1 + grow && tl.y < 2.8 + grow) {
    /* Top left: the heaviest, and the only one that runs the whole way down. */
    float c = corner(tl, k, 0.62, 0.46, 0.33);
    c = smin(c, runSdf(tl, vec2(0.02,  0.60), 1.70, 0.125, 0.058, 0.30, 3.4), 0.12);
    c = smin(c, runSdf(tl, vec2(0.66,  0.24), 0.98, 0.094, 0.045, 1.15, 3.8), 0.10);
    c = smin(c, runSdf(tl, vec2(1.24, -0.10), 0.54, 0.068, 0.034, 2.05, 3.2), 0.08);
    d = c;
  }

  vec2 tr = vec2(W - P.x, P.y);
  if (tr.x < 2.1 + grow && tr.y < 2.4 + grow) {
    /* Top right: lighter and shorter, so the card is never symmetrical. */
    float c = corner(tr, k, 0.54, 0.40, 0.28);
    c = smin(c, runSdf(tr, vec2(0.04, 0.50), 1.22, 0.108, 0.050, 0.70, 3.6), 0.11);
    c = smin(c, runSdf(tr, vec2(0.68, 0.14), 0.62, 0.076, 0.036, 1.90, 3.1), 0.09);
    d = min(d, c);
  }

  /* The bottom two, where it has gathered. Paint cannot run upward, so
     nothing hangs off these: they only sit and catch. */
  vec2 bl = vec2(P.x, H - P.y);
  if (bl.x < 2.0 + grow && bl.y < 1.3 + grow) {
    d = min(d, corner(bl, k, 0.50, 0.37, 0.26));
  }

  vec2 br = vec2(W - P.x, H - P.y);
  if (br.x < 2.0 + grow && br.y < 1.3 + grow) {
    d = min(d, corner(br, k, 0.58, 0.43, 0.30));
  }

  /* Two drops that have let go of the long runs, on their own clocks. */
  d = min(d, dropSdf(P, 0.02,     2.45, 0.056, H + 1.0, 0.0, 7.3));
  d = min(d, dropSdf(P, W - 0.04, 1.85, 0.050, H + 1.0, 3.1, 9.1));

  /* The exit: every surface swells until the card is one sheet of paint. */
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
  c += vec3(1.00, 0.98, 0.95) * pow(k, 64.0) * 5.0;
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
    float t = clamp(-d / 0.115, 0.0, 1.0);
    float u = 1.0 - t;
    float h = sqrt(max(1.0 - u * u, 0.0));

    /* A second, far broader arc over the whole body. */
    float ub = 1.0 - clamp(-d / 1.70, 0.0, 1.0);
    float hb = sqrt(max(1.0 - ub * ub, 0.0));

    /* Normal from the height field. Forward differences: two extra field
       evaluations rather than four, which matters because this runs for
       every pixel of the silhouette. */
    float e = max(px, 0.005);
    vec2  g = vec2(paintSdf(P + vec2(e, 0.0)) - d,
                   paintSdf(P + vec2(0.0, e)) - d) / e;
    float slope = min(u / max(h, 0.10), 7.0)
                + min(ub / max(hb, 0.10), 3.0) * 0.28;
    vec3  n = normalize(vec3(g * slope * 1.25, 1.0));

    /* The gradient falls below unit length inside a blend, which is exactly
       where two bodies have merged: free occlusion in the creases. */
    float ao = mix(0.42, 1.0, clamp(length(g) * 1.05, 0.0, 1.0));

    /* The body is still moving, so the surface is never quite flat. Ripples
       ride down it and drag the highlight with them, and that travelling
       highlight is what the eye reads as wet. */
    vec2  fp = P * 1.5 + vec2(0.0, -uTime * 0.10);
    float f0 = ripple(fp);
    vec2  fg = vec2(ripple(fp + vec2(0.13, 0.0)) - f0,
                    ripple(fp + vec2(0.0, 0.13)) - f0);
    n = normalize(n + vec3(fg * 1.15 * t, 0.0));

    vec3 V  = vec3(0.0, 0.0, 1.0);
    vec3 L1 = normalize(vec3(-0.46, -0.72, 0.52));
    vec3 L2 = normalize(vec3( 0.76, -0.16, 0.38));

    /* One clean colour: cartoon forms want a flat, confident fill, and the
       shape does the describing. */
    vec3 albedo = pow(vec3(0.775, 0.425, 0.055), vec3(2.2));

    float nl1 = max(dot(n, L1), 0.0);
    float nl2 = max(dot(n, L2), 0.0);

    /* Keep the fill mean so the body has somewhere dark to go: a form lit
       from every side has no shape, and the highlight has nothing to beat. */
    vec3 diff = albedo * (0.045 + 1.60 * nl1) * ao
              + albedo * vec3(1.0, 0.78, 0.56) * 0.20 * nl2;

    /* Where the film thins at the rim, light gets through it. */
    diff += pow(vec3(1.00, 0.46, 0.10), vec3(2.2)) * pow(u, 2.6) * 0.65 * ao;

    float nv = max(dot(n, V), 0.0);
    float fres = 0.035 + 0.965 * pow(1.0 - nv, 5.0);
    vec3 refl = env(reflect(-V, n)) * (0.26 + 0.85 * fres);

    /* One tight, confident highlight rather than a scatter of them: the drawn
       kind, but shaped by a real microfacet lobe so it wraps the form. */
    vec3 spec = vec3(1.0, 0.985, 0.96)
              * (ggx(n, V, L1, 0.062) * 1.55 + ggx(n, V, L2, 0.20) * 0.30);

    /* A rim of the key catching the far shoulder, which is what lifts a
       cartoon form off its background without outlining it. */
    float rim = pow(1.0 - nv, 3.5) * max(dot(n, normalize(vec3(-0.6, -0.75, 0.0))), 0.0);
    spec += vec3(1.0, 0.86, 0.62) * rim * 0.55;

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
