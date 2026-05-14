// Shared GLSL noise functions — inject into shader templates via ${GLSL_*}

export const GLSL_HASH = /* glsl */`
float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float hash1(float n) { return fract(sin(n) * 43758.5453123); }
vec2  hash2(vec2 p)  { p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
vec3  hash3(vec3 p)  { p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
`

export const GLSL_NOISE = /* glsl */`
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
`

export const GLSL_FBM = /* glsl */`
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`

export const GLSL_VORONOI = /* glsl */`
vec2 voronoi(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float md = 8.0; vec2 mr = vec2(0.0);
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 o = hash2(n + g);
    vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; }
  }
  return vec2(sqrt(md), dot(mr, mr));
}
`
