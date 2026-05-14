import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uStrength;
  uniform float uSpeed;
  uniform float uTime;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float wave = sin(uv.y * 25.0 + uTime * uSpeed) * uStrength * 0.008
               + sin(uv.y * 15.0 + uTime * uSpeed * 0.7 + 1.3) * uStrength * 0.005;
    vec2 nuv = vec2(uv.x + wave, uv.y);
    outputColor = texture2D(inputBuffer, nuv);
  }
`

export class HeatDistortionEffect extends Effect {
  private _time = 0
  constructor(strength = 0.5, speed = 1.0) {
    super('HeatDistortionEffect', shader, {
      uniforms: new Map([
        ['uStrength', new Uniform(strength)],
        ['uSpeed',    new Uniform(speed)],
        ['uTime',     new Uniform(0)],
      ]),
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt: number) {
    this._time += dt
    ;(this.uniforms.get('uTime') as Uniform<number>).value = this._time
  }
  setStrength(v: number) { (this.uniforms.get('uStrength') as Uniform<number>).value = v }
  setSpeed(v: number)    { (this.uniforms.get('uSpeed')    as Uniform<number>).value = v }
}
