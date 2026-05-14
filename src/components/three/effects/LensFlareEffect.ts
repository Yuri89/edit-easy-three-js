import { Effect } from 'postprocessing'
import { Uniform, Vector2 } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uIntensity;
  uniform vec2  uCenter;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 col = inputColor;
    vec2 axis = uv - uCenter;
    // Ghost circles
    float d1 = length(uv - (uCenter + axis * 0.85)) / 0.09;
    float d2 = length(uv - (uCenter + axis * 0.55)) / 0.055;
    float d3 = length(uv - (uCenter - axis * 0.35)) / 0.038;
    float d4 = length(uv - (uCenter - axis * 0.75)) / 0.026;
    col.rgb += vec3(1.0, 0.9, 0.6)  * exp(-d1 * d1 * 5.0) * uIntensity * 0.5;
    col.rgb += vec3(0.7, 0.5, 1.0)  * exp(-d2 * d2 * 7.0) * uIntensity * 0.4;
    col.rgb += vec3(0.4, 0.8, 1.0)  * exp(-d3 * d3 * 9.0) * uIntensity * 0.3;
    col.rgb += vec3(1.0, 0.4, 0.3)  * exp(-d4 * d4 * 11.0)* uIntensity * 0.25;
    // Horizontal streak
    float streak = exp(-abs(uv.y - uCenter.y) * 90.0) * exp(-abs(uv.x - uCenter.x) * 1.5);
    col.rgb += vec3(1.0, 0.95, 0.8) * streak * uIntensity * 0.25;
    outputColor = col;
  }
`

export class LensFlareEffect extends Effect {
  constructor(intensity = 1.0, center = new Vector2(0.25, 0.75)) {
    super('LensFlareEffect', shader, {
      uniforms: new Map([
        ['uIntensity', new Uniform(intensity)],
        ['uCenter',    new Uniform(center)],
      ]) as Map<string, Uniform<number>>,
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, _dt: number) {}
  setIntensity(v: number) { (this.uniforms.get('uIntensity') as Uniform<number>).value = v }
}
