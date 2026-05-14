import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uStrength;
  uniform float uTime;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float wX = sin(uv.y * 8.0 + uTime * 1.5) * uStrength * 0.015
             + sin(uv.y * 5.0 + uTime * 0.9 + 0.8) * uStrength * 0.008;
    float wY = sin(uv.x * 6.0 + uTime) * uStrength * 0.008;
    vec4 col = texture2D(inputBuffer, uv + vec2(wX, wY));
    // Caustic shimmer
    float c = abs(sin(uv.x * 14.0 + uTime * 2.0) * sin(uv.y * 10.0 + uTime * 1.6)) * uStrength * 0.12;
    // Blue-green tint
    col.rgb = mix(col.rgb, col.rgb * vec3(0.25, 0.65, 1.0), uStrength * 0.55);
    col.rgb += vec3(0.0, 0.1, 0.05) * c;
    outputColor = col;
  }
`

export class UnderwaterEffect extends Effect {
  private _time = 0
  constructor(strength = 0.5) {
    super('UnderwaterEffect', shader, {
      uniforms: new Map([
        ['uStrength', new Uniform(strength)],
        ['uTime',     new Uniform(0)],
      ]),
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt: number) {
    this._time += dt
    ;(this.uniforms.get('uTime') as Uniform<number>).value = this._time
  }
  setStrength(v: number) { (this.uniforms.get('uStrength') as Uniform<number>).value = v }
}
