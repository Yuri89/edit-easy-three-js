import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uIntensity;
  uniform float uTime;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float lum = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    float noise = fract(sin(dot(uv + fract(uTime * 0.01), vec2(12.9898, 78.233))) * 43758.5453);
    float scan = 1.0 - step(0.5, fract(uv.y * 300.0)) * 0.08;
    vec2 vig = uv * 2.0 - 1.0;
    float v = 1.0 - dot(vig, vig) * 0.15;
    float val = lum * uIntensity + noise * 0.04;
    outputColor = vec4(0.0, val * scan * v, val * 0.1 * v, inputColor.a);
  }
`

export class NightVisionEffect extends Effect {
  private _time = 0
  constructor(intensity = 2.0) {
    super('NightVisionEffect', shader, {
      uniforms: new Map([
        ['uIntensity', new Uniform(intensity)],
        ['uTime',      new Uniform(0)],
      ]),
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt: number) {
    this._time += dt
    ;(this.uniforms.get('uTime') as Uniform<number>).value = this._time
  }
  setIntensity(v: number) { (this.uniforms.get('uIntensity') as Uniform<number>).value = v }
}
