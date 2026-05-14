import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uIntensity;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 col = inputColor;
    float dy = uv.y - 0.5;
    float vertFall = exp(-dy * dy * 180.0);
    float streak = 0.0;
    // Sample brightness horizontally across screen center
    for (int i = -14; i <= 14; i++) {
      float xi = uv.x + float(i) * 0.011;
      if (xi < 0.0 || xi > 1.0) continue;
      vec3 s = texture2D(inputBuffer, vec2(xi, 0.5)).rgb;
      float bright = max(s.r, max(s.g, s.b));
      streak += max(0.0, bright - 0.55) * exp(-abs(float(i)) * 0.22);
    }
    col.rgb += vec3(0.06, 0.22, 1.0) * streak * vertFall * uIntensity * 1.8;
    outputColor = col;
  }
`

export class AnamorphicFlareEffect extends Effect {
  constructor(intensity = 1.0) {
    super('AnamorphicFlareEffect', shader, {
      uniforms: new Map([['uIntensity', new Uniform(intensity)]]),
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, _dt: number) {}
  setIntensity(v: number) { (this.uniforms.get('uIntensity') as Uniform<number>).value = v }
}
