import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uIntensity;
  uniform float uTime;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Horizontal drift
    float drift = sin(uv.y * 30.0 + uTime * 3.0) * uIntensity * 0.004;
    vec2 nuv = vec2(uv.x + drift, uv.y);
    // Rolling bar
    float roll = fract(uTime * 0.08);
    float bar  = step(1.0 - uIntensity * 0.04, fract(uv.y + roll)) * 0.3;
    // Color channel split
    float ca = uIntensity * 0.003;
    float r  = texture2D(inputBuffer, vec2(nuv.x + ca, nuv.y)).r;
    float g  = texture2D(inputBuffer, nuv).g;
    float b  = texture2D(inputBuffer, vec2(nuv.x - ca, nuv.y)).b;
    // Scanlines
    float scan = 1.0 - step(0.5, fract(uv.y * 240.0)) * 0.12 * uIntensity;
    // Noise
    float noise = fract(sin(dot(uv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453) * uIntensity * 0.08;
    vec3 col = vec3(r, g, b) * scan + noise - bar;
    outputColor = vec4(max(col, vec3(0.0)), inputColor.a);
  }
`

export class VHSEffect extends Effect {
  private _time = 0
  constructor(intensity = 0.8) {
    super('VHSEffect', shader, {
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
