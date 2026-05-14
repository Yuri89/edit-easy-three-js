import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uStrength;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 p = uv * 2.0 - 1.0;
    float r2 = dot(p, p);
    vec2 dp = p * (1.0 + uStrength * r2 + uStrength * r2 * r2 * 0.3);
    vec2 nuv = dp * 0.5 + 0.5;
    if (nuv.x < 0.0 || nuv.x > 1.0 || nuv.y < 0.0 || nuv.y > 1.0) {
      outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      outputColor = texture2D(inputBuffer, nuv);
    }
  }
`

export class LensDistortionEffect extends Effect {
  constructor(strength = 0.3) {
    super('LensDistortionEffect', shader, {
      uniforms: new Map([['uStrength', new Uniform(strength)]]),
    })
  }
  setStrength(v: number) { (this.uniforms.get('uStrength') as Uniform<number>).value = v }
  // satisfy override
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, _dt: number) {}
}
