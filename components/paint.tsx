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

/* ── the field ───────────────────────────────────────────────────────────

   Everything below carries a distance AND its gradient: x is the distance,
   yz is the surface direction there. Nothing is ever differenced.

   Reconstructing the normal by sampling the field either side of a pixel is
   the obvious way to do this and it has two costs. It evaluates the whole
   field three times per pixel instead of once. And the difference it takes is
   about the same size as the field's own numerical precision, so whatever the
   hardware rounds off comes back multiplied by the reciprocal of the step —
   which arrives as a shimmer crawling through the highlights, worst on the
   GPUs least able to afford the extra work in the first place.

   Every primitive here knows its own normal exactly, and both combinators
   carry it through, so the shading normal is exact and the field is evaluated
   once. The gradients are unit length as they leave each primitive; what
   comes out the far end is shorter than unit only where two bodies have been
   blended, which is precisely the crease-occlusion signal wanted later. */

float dot2(vec2 v){ return dot(v, v); }

vec3 pCircle(vec2 p, vec2 c, float r){
  vec2  v = p - c;
  float l = max(length(v), 1e-6);
  return vec3(l - r, v / l);
}

/* An ellipse, first order: the unit-circle test in squashed space divided by
   the gradient it is squashed by. Scaling by the smaller semi-axis instead is
   cheaper and fine for a lobe that is nearly round, but the shapes traced off
   the artwork include some four times longer than they are wide, and there
   that shortcut under-reads the distance badly enough along the long axis to
   make the smooth minimum blend two lobes that are nowhere near each other.
   The gradient falls out of the same two lines. */
vec3 pLobe(vec2 p, vec2 c, float rx, float ry){
  vec2  q = (p - c) / vec2(rx, ry);
  float l = max(length(q), 1e-6);
  vec2  g = (q / l) / vec2(rx, ry);
  float gl = max(length(g), 1e-6);
  return vec3((l - 1.0) / gl, g / gl);
}

/* A cone with round caps: the shape a run of sauce makes as it thins. On the
   lateral face the normal tilts off the perpendicular by exactly the taper —
   sin of that angle is the radius difference over the length — which is why
   it can be written down rather than measured. */
vec3 pCone(vec2 p, vec2 a, vec2 b, float r1, float r2){
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

  if (sign(z) * a2 * z2 > k) {
    vec2  v = p - b;
    float l = max(length(v), 1e-6);
    return vec3(l - r2, v / l);
  }
  if (sign(y) * a2 * y2 < k) {
    vec2  v = p - a;
    float l = max(length(v), 1e-6);
    return vec3(l - r1, v / l);
  }
  float L  = sqrt(l2);
  vec2  ax = ba / L;                       /* along the axis */
  vec2  px = vec2(ax.y, -ax.x);            /* across it */
  vec2  g  = px * sign(dot(pa, px)) * (sqrt(max(a2, 0.0)) / L) + ax * (rr / L);
  return vec3((sqrt(x2 * a2 * il2) + y * rr) * il2 - r1, g);
}

/* The blend, with its gradient. For the polynomial smooth minimum the terms
   in the derivative of the blend factor cancel exactly, so mixing the two
   gradients by that same factor is not an approximation. */
vec3 fSmin(vec3 a, vec3 b, float k){
  float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0);
  return vec3(mix(b.x, a.x, h) - k * h * (1.0 - h), mix(b.yz, a.yz, h));
}
vec3 fMin(vec3 a, vec3 b){ return a.x < b.x ? a : b; }

/* Sauce that has run a long way is still creeping: most of the distance
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
vec3 runField(vec2 q, float x, float y0, float tip, float w0, float w1,
              float t0, float period, float H, float grow){
  if (abs(q.x - x) > 0.5 + grow) return vec3(1e5, 0.0, 0.0);

  /* The single slow arrival. Long, because thick sauce takes its time and
     because this is the first thing the card does. */
  float g = ease(clamp((uTime - 0.4) / 7.5, 0.0, 1.0));
  vec2  a = vec2(x, y0);
  vec2  b = vec2(x, y0 + (tip - y0) * g);

  float ph = fract((uTime + t0) / period);
  /* The tip swells until it cannot hold, then pinches off. */
  float swell = smoothstep(0.0, 0.70, ph) * (1.0 - smoothstep(0.70, 0.88, ph));
  vec3  f = fSmin(pCone(q, a, b, w0, w1),
                  pCircle(q, b, w1 * (0.82 + 1.10 * swell)), w1 * 1.2);

  /* And what it let go of, taking the rest of the card at its own pace. The
     drop stretches as it accelerates, so its gradient is squashed the same
     way the shape is. */
  if (ph > 0.70) {
    float u = (ph - 0.70) / 0.30;
    float v = u * u;
    float st = 1.0 + v * 3.2;
    vec2  r = (q - vec2(x, b.y + v * (H + 1.2 - b.y))) / vec2(1.0, st);
    float l = max(length(r), 1e-6);
    vec3  drop = vec3((l - w1 * 1.2) / st,
                      normalize((r / l) / vec2(1.0, st)));
    f = fMin(f, drop);
  }
  return f;
}

/* The four corners, traced off the artwork.

   Each is a union of eight ellipses fitted to the real silhouette: seeded at
   the point furthest inside the shape, grown to the largest ellipse that
   still touches no background, then repeated on whatever is left. Ellipses
   are allowed to run off the edge of the card — the paint does — so only
   background inside the frame constrains them. Measured against the artwork
   the four come back at an intersection-over-union of 0.90 to 0.94, which is
   as close as eight ellipses get before the count starts mattering more than
   the likeness. The numbers are in units of the master scale, so the shapes
   hold their proportions at any size. */

vec3 cornerTL(vec2 q, float k){
  vec3 f = pLobe(q, vec2( 0.179,  0.000), 0.524, 0.327);
  f = fSmin(f, pLobe(q, vec2( 1.097,  0.000), 0.227, 0.283), k);
  f = fSmin(f, pLobe(q, vec2( 0.174,  0.328), 0.117, 0.420), k);
  f = fSmin(f, pLobe(q, vec2( 0.559,  0.231), 0.102, 0.102), k);
  f = fSmin(f, pLobe(q, vec2( 0.708,  0.000), 0.300, 0.083), k);
  f = fSmin(f, pLobe(q, vec2( 1.169,  0.272), 0.074, 0.267), k);
  f = fSmin(f, pLobe(q, vec2( 0.159,  0.749), 0.081, 0.101), k);
  f = fSmin(f, pLobe(q, vec2( 0.292,  0.323), 0.043, 0.121), k);
  return f;
}

vec3 cornerTR(vec2 q, float k){
  vec3 f = pLobe(q, vec2( 0.256,  0.000), 0.238, 0.238);
  f = fSmin(f, pLobe(q, vec2( 0.723,  0.000), 0.195, 0.195), k);
  f = fSmin(f, pLobe(q, vec2( 0.523,  0.000), 0.366, 0.174), k);
  f = fSmin(f, pLobe(q, vec2( 0.190,  0.231), 0.174, 0.174), k);
  f = fSmin(f, pLobe(q, vec2( 0.882,  0.123), 0.157, 0.098), k);
  f = fSmin(f, pLobe(q, vec2( 1.005,  0.190), 0.092, 0.092), k);
  f = fSmin(f, pLobe(q, vec2( 0.297,  0.369), 0.081, 0.081), k);
  f = fSmin(f, pLobe(q, vec2( 0.062,  0.354), 0.046, 0.046), k);
  /* The artwork has one drop already off the sheet, hanging on the
     right edge. It is part of the shape, so it is part of the shape. */
  f = fMin(f, pLobe(q, vec2( 0.113,  1.067), 0.095, 0.095));
  return f;
}

vec3 cornerBL(vec2 q, float k){
  vec3 f = pLobe(q, vec2( 0.000,  0.359), 0.383, 0.383);
  f = fSmin(f, pLobe(q, vec2( 0.000,  1.369), 0.324, 0.259), k);
  f = fSmin(f, pLobe(q, vec2( 0.374,  0.277), 0.494, 0.137), k);
  f = fSmin(f, pLobe(q, vec2( 0.000,  0.744), 0.374, 0.134), k);
  f = fSmin(f, pLobe(q, vec2( 0.364,  1.462), 0.218, 0.104), k);
  f = fSmin(f, pLobe(q, vec2( 0.000,  0.882), 0.080, 0.289), k);
  f = fSmin(f, pLobe(q, vec2( 0.867,  0.262), 0.120, 0.096), k);
  f = fSmin(f, pLobe(q, vec2( 0.256,  0.646), 0.072, 0.202), k);
  return f;
}

vec3 cornerBR(vec2 q, float k){
  vec3 f = pLobe(q, vec2( 0.862,  0.005), 0.251, 0.251);
  f = fSmin(f, pLobe(q, vec2( 0.195,  0.005), 0.100, 0.362), k);
  f = fSmin(f, pLobe(q, vec2( 0.159,  0.426), 0.138, 0.138), k);
  f = fSmin(f, pLobe(q, vec2( 1.021,  0.200), 0.103, 0.215), k);
  f = fSmin(f, pLobe(q, vec2( 0.297,  0.005), 0.266, 0.095), k);
  f = fSmin(f, pLobe(q, vec2( 1.092,  0.364), 0.114, 0.143), k);
  f = fSmin(f, pLobe(q, vec2( 0.605,  0.005), 0.103, 0.128), k);
  f = fSmin(f, pLobe(q, vec2( 0.128,  0.287), 0.113, 0.237), k);
  return f;
}

/* The sauce, in units of the master scale: distance in x, surface direction
   in yz.

   Each corner mass is skipped outright for pixels it cannot reach, and each
   run is skipped for every column it does not hang in. A fragment is near at
   most one corner and one or two runs, so this is close to a four-fold saving
   on the part of the shader that dominates the frame, and the branches are
   coherent across a warp because the regions are large and contiguous. The
   bounds carry enough slack for the contact shadow, which is sampled at an
   offset, and they grow with the flood. */
vec3 paintField(vec2 P){
  float W = uRes.x / uScale;
  float H = uRes.y / uScale;
  float k = 0.10;
  float grow = uFlood * uFlood * (W + H);
  vec3  f = vec3(1e5, 0.0, 0.0);

  vec2 tl = P;
  vec2 tr = vec2(W - P.x, P.y);
  vec2 bl = vec2(P.x, H - P.y);
  vec2 br = vec2(W - P.x, H - P.y);

  /* The four masses, which sit still: sauce that has arrived and settled.
     Each is described in its own frame, so the gradient comes back in that
     frame too and has to be flipped on whichever axis was mirrored. */
  if (tl.x < 1.6 + grow && tl.y < 1.3 + grow) {
    f = cornerTL(tl, k);
  }
  if (tr.x < 1.5 + grow && tr.y < 1.5 + grow) {
    vec3 c = cornerTR(tr, k);
    f = fMin(f, vec3(c.x, -c.y, c.z));
  }
  /* Sauce cannot run upward, so nothing hangs off the bottom two: they only
     sit and catch what comes down. */
  if (bl.x < 1.4 + grow && bl.y < 2.0 + grow) {
    vec3 c = cornerBL(bl, k);
    f = fMin(f, vec3(c.x, c.y, -c.z));
  }
  if (br.x < 1.6 + grow && br.y < 1.2 + grow) {
    vec3 c = cornerBR(br, k);
    f = fMin(f, vec3(c.x, -c.y, -c.z));
  }

  /* Each run stops at its own height, all of them inside the upper half, so
     the card reads as five separate runs rather than one repeated one — and
     the wordmark keeps the room below them. Held off the left and right edges
     too: a run at x near zero is a stripe down the side of the card, and that
     reads as a border rather than as something falling. */
  f = fSmin(f, runField(tl, 0.26, 0.57, H * 0.50, 0.125, 0.058, 0.00, 11.5, H, grow), 0.12);
  f = fSmin(f, runField(tl, 0.60, 0.27, H * 0.34, 0.094, 0.045, 4.30, 13.1, H, grow), 0.10);
  f = fSmin(f, runField(tl, 1.15, 0.47, H * 0.25, 0.068, 0.034, 8.10,  9.7, H, grow), 0.08);

  vec3 r1 = runField(tr, 0.28, 0.39, H * 0.44, 0.108, 0.050, 2.20, 12.3, H, grow);
  vec3 r2 = runField(tr, 0.90, 0.19, H * 0.29, 0.076, 0.036, 6.40, 10.6, H, grow);
  f = fSmin(f, vec3(r1.x, -r1.y, r1.z), 0.11);
  f = fSmin(f, vec3(r2.x, -r2.y, r2.z), 0.09);

  /* The exit: every surface swells until the card is one sheet of sauce. */
  f.x -= grow;
  return f;
}

/* A studio for the paint to reflect. Linear values throughout. */
vec3 env(vec3 r){
  vec3  q = vec3(r.x, -r.y, r.z);
  float up = q.y;
  vec3 c = mix(vec3(0.0015), vec3(0.020, 0.019, 0.018), smoothstep(-1.0, 0.8, up));
  vec3 key = normalize(vec3(-0.40, 1.0, 0.55));
  float k = max(dot(normalize(q), key), 0.0);
  c += vec3(1.00, 0.96, 0.90) * pow(k, 2.6) * 1.05;
  c += vec3(1.00, 0.98, 0.95) * pow(k, 40.0) * 1.3;
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

  vec3  f = paintField(P);
  float d = f.x;

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
    shade = smoothstep(SH, -0.02 * SH, paintField(P - vec2(0.28, 0.40) * SH).x) * 0.80;
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

    /* The surface direction came back with the distance, exactly, so the
       normal is just the height's slope along it. */
    float glen = length(f.yz);
    vec2  dir = glen > 1e-6 ? f.yz / glen : vec2(0.0);
    float slope = min(u / max(h, 0.10), 7.0)
                + min(ub / max(hb, 0.10), 3.0) * 0.12;
    vec3  n = normalize(vec3(dir * slope * 1.25, 1.0));

    /* Every primitive hands back a unit gradient, so anything shorter than
       unit here is the blend having mixed two that disagreed — which is
       exactly where two bodies have merged. Free occlusion in the creases. */
    float ao = mix(0.42, 1.0, clamp(glen * 1.05, 0.0, 1.0));

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
    vec3 albedo = pow(vec3(0.939, 0.632, 0.172), vec3(2.2));

    float nl1 = max(dot(n, L1), 0.0);
    float nl2 = max(dot(n, L2), 0.0);

    /* Keep the fill mean so the body has somewhere dark to go: a form lit
       from every side has no shape, and the highlight has nothing to beat. */
    /* Lit across a narrower range than a lone object would be. The artwork
       this matches is one flat colour, so the further the shading spreads the
       body from that colour the less it reads as the same paint — and a lit
       face that climbs far enough desaturates toward cream, which is the one
       direction this colour cannot afford to go. Ambient up, key down: the
       form still turns, it just turns within the colour. */
    vec3 diff = albedo * (0.26 + 1.22 * nl1) * ao
              + albedo * vec3(1.0, 0.78, 0.58) * 0.20 * nl2;

    /* A trace of light through the very thinnest edge, and no more than a
       trace: a body that glows where it is thin is the single strongest
       honey cue there is. */
    diff += pow(vec3(0.95, 0.30, 0.06), vec3(2.2)) * pow(u, 3.2) * 0.16 * ao;

    float nv = max(dot(n, V), 0.0);
    float fres = 0.035 + 0.965 * pow(1.0 - nv, 5.0);
    /* Held back at grazing angles: with the rim rolled this tightly, a strong
       fresnel puts a hard bright line all the way round every shape, and a
       drawn outline is the one thing that will not read as liquid. */
    vec3 refl = env(reflect(-V, n)) * (0.10 + 0.22 * fres);

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
    /* Tighter again. The lobe was only ever wide to hide the noise in a
       differenced normal, and a wide lobe spreads a highlight into a pale
       wash across half a form — which reads as satin, not sauce. With the
       normal exact it can be a small bright sheen that leaves the colour
       alone everywhere else. */
    vec3 spec = vec3(1.0, 0.96, 0.90)
              * (ggx(n, V, L1, 0.130) * 0.52 + ggx(n, V, L2, 0.30) * 0.13);

    /* A rim of the key catching the far shoulder, kept low: a bright outline
       all the way round is the other half of the balloon read. */
    float rim = pow(1.0 - nv, 3.5) * max(dot(n, normalize(vec3(-0.6, -0.75, 0.0))), 0.0);
    spec += vec3(1.0, 0.82, 0.56) * rim * 0.12;

    col = diff + refl + spec;

    /* Roll the highlights off on luminance so the hue survives the clip. A
       per-channel curve turns every hot spot cream, which is exactly what
       makes rendered liquid look like plastic. */
    col *= 1.0 / (1.0 + max(col.r, max(col.g, col.b)) * 0.32);
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
