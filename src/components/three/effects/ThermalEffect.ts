import { Effect } from 'postprocessing'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float lum = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 col;
    float t = lum;
    // black → blue → cyan → yellow → red → white
    vec3 c0 = vec3(0.0, 0.0, 0.0);
    vec3 c1 = vec3(0.0, 0.0, 0.8);
    vec3 c2 = vec3(0.0, 0.8, 0.8);
    vec3 c3 = vec3(0.8, 0.8, 0.0);
    vec3 c4 = vec3(1.0, 0.0, 0.0);
    vec3 c5 = vec3(1.0, 1.0, 1.0);
    if      (t < 0.2) col = mix(c0, c1, t * 5.0);
    else if (t < 0.4) col = mix(c1, c2, (t - 0.2) * 5.0);
    else if (t < 0.6) col = mix(c2, c3, (t - 0.4) * 5.0);
    else if (t < 0.8) col = mix(c3, c4, (t - 0.6) * 5.0);
    else              col = mix(c4, c5, (t - 0.8) * 5.0);
    outputColor = vec4(col, inputColor.a);
  }
`

export class ThermalEffect extends Effect {
  constructor() { super('ThermalEffect', shader, {}) }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, _dt: number) {}
}
