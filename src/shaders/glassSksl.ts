// SKSL (Skia Shading Language) source for the animated liquid glass effect.
// Used with Skia.RuntimeEffect.Make() at runtime.

export const GLASS_SKSL = `
uniform shader image;
uniform vec2 resolution;
uniform float time;
uniform float distortion;
uniform float iriAmount;

half4 main(vec2 xy) {
  vec2 norm = xy / resolution;

  // Animated ripple distortion — sine waves in both axes
  vec2 offset = vec2(
    sin(norm.y * 18.0 + time * 2.2) * distortion,
    cos(norm.x * 16.0 + time * 1.7) * distortion
  );

  // Per-channel UV shift for chromatic aberration
  float r = image.eval(xy + offset * 1.25).r;
  float g = image.eval(xy + offset       ).g;
  float b = image.eval(xy + offset * 0.75).b;

  // Thin-film iridescence: angle-based hue oscillation
  float phase = norm.x * 9.0 + norm.y * 7.0 + time * 1.0;
  vec3 iri = vec3(
    0.5 + 0.5 * sin(phase),
    0.5 + 0.5 * sin(phase + 2.094),
    0.5 + 0.5 * sin(phase + 4.189)
  );

  half4 refracted = half4(r, g, b, 1.0);
  half4 iriColor  = half4(half3(iri), 1.0);
  return mix(refracted, iriColor, half(iriAmount));
}
`
