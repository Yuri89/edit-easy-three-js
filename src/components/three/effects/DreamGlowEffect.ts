import { Effect } from 'postprocessing'
import { Uniform, Color } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uIntensity;
  uniform vec3  uColor;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float s = uIntensity * 0.016;
    vec4 blur = vec4(0.0);
    blur += texture2D(inputBuffer, uv + vec2( s,  0.0));
    blur += texture2D(inputBuffer, uv + vec2(-s,  0.0));
    blur += texture2D(inputBuffer, uv + vec2( 0.0,  s));
    blur += texture2D(inputBuffer, uv + vec2( 0.0, -s));
    blur += texture2D(inputBuffer, uv + vec2( s,  s) * 0.707);
    blur += texture2D(inputBuffer, uv + vec2(-s,  s) * 0.707);
    blur += texture2D(inputBuffer, uv + vec2( s, -s) * 0.707);
    blur += texture2D(inputBuffer, uv + vec2(-s, -s) * 0.707);
    blur /= 8.0;
    vec3 glow = blur.rgb * uColor * uIntensity * 0.35;
    outputColor = vec4(inputColor.rgb + glow, inputColor.a);
  }
`

export class DreamGlowEffect extends Effect {
  constructor(intensity = 1.5, color = new Color('#ffccff')) {
    super('DreamGlowEffect', shader, {
      uniforms: new Map([
        ['uIntensity', new Uniform(intensity)],
        ['uColor',     new Uniform(color)],
      ]) as Map<string, Uniform<number>>,
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, _dt: number) {}
  setIntensity(v: number)  { (this.uniforms.get('uIntensity') as Uniform<number>).value = v }
  setColor(c: Color)       { (this.uniforms.get('uColor') as Uniform<Color>).value = c }
}
