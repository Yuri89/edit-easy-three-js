import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uTime;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Fish-eye distortion
    vec2 p = uv * 2.0 - 1.0;
    float r2 = dot(p, p);
    vec2 fp = p * (1.0 + 0.08 * r2);
    vec2 nuv = fp * 0.5 + 0.5;
    vec4 src = (nuv.x < 0.0 || nuv.x > 1.0 || nuv.y < 0.0 || nuv.y > 1.0)
               ? vec4(0.0) : texture2D(inputBuffer, nuv);
    float lum = dot(src.rgb, vec3(0.299, 0.587, 0.114));
    // Monochrome green tint
    vec3 col = vec3(lum * 0.3, lum * 0.95, lum * 0.3);
    // Scanlines
    col *= 1.0 - step(0.5, fract(uv.y * 200.0)) * 0.15;
    // Vignette
    float v = 1.0 - dot(p * 0.8, p * 0.8) * 0.5;
    col *= v;
    // Noise
    float noise = fract(sin(dot(uv + fract(uTime * 0.03), vec2(12.9898, 78.233))) * 43758.5453) * 0.035;
    col += noise;
    outputColor = vec4(col, src.a);
  }
`

export class CCTVEffect extends Effect {
  private _time = 0
  constructor() {
    super('CCTVEffect', shader, {
      uniforms: new Map([['uTime', new Uniform(0)]]),
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt: number) {
    this._time += dt
    ;(this.uniforms.get('uTime') as Uniform<number>).value = this._time
  }
}
