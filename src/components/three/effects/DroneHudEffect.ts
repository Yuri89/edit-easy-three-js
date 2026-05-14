import { Effect } from 'postprocessing'
import { Uniform, Color } from 'three'
import type { WebGLRenderer, WebGLRenderTarget } from 'three'

const shader = /* glsl */`
  uniform float uTime;
  uniform vec3  uColor;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 col = inputColor;
    float lw = 0.0018;
    float mg = 0.07;  // margin
    float cs = 0.055; // bracket arm length
    float hud = 0.0;

    // Corner brackets — 4 corners, each has H + V arm
    // Top-left H
    hud = max(hud, step(mg, uv.x) * step(uv.x, mg + cs) * step(abs(uv.y - mg), lw));
    // Top-left V
    hud = max(hud, step(mg, uv.y) * step(uv.y, mg + cs * 0.65) * step(abs(uv.x - mg), lw));
    // Top-right H
    hud = max(hud, step(1.0 - mg - cs, uv.x) * step(uv.x, 1.0 - mg) * step(abs(uv.y - mg), lw));
    // Top-right V
    hud = max(hud, step(mg, uv.y) * step(uv.y, mg + cs * 0.65) * step(abs(uv.x - (1.0 - mg)), lw));
    // Bottom-left H
    hud = max(hud, step(mg, uv.x) * step(uv.x, mg + cs) * step(abs(uv.y - (1.0 - mg)), lw));
    // Bottom-left V
    hud = max(hud, step(1.0 - mg - cs * 0.65, uv.y) * step(uv.y, 1.0 - mg) * step(abs(uv.x - mg), lw));
    // Bottom-right H
    hud = max(hud, step(1.0 - mg - cs, uv.x) * step(uv.x, 1.0 - mg) * step(abs(uv.y - (1.0 - mg)), lw));
    // Bottom-right V
    hud = max(hud, step(1.0 - mg - cs * 0.65, uv.y) * step(uv.y, 1.0 - mg) * step(abs(uv.x - (1.0 - mg)), lw));

    // Crosshair
    hud = max(hud, step(abs(uv.x - 0.5), 0.013) * step(abs(uv.y - 0.5), lw));
    hud = max(hud, step(abs(uv.y - 0.5), 0.013) * step(abs(uv.x - 0.5), lw));
    // Center gap
    float gap = step(abs(uv.x - 0.5), 0.004) * step(abs(uv.y - 0.5), 0.004);
    hud = max(hud, gap * 0.0); hud *= (1.0 - gap);

    // Scanning line
    float scanY = fract(uTime * 0.22);
    hud = max(hud, step(abs(uv.y - scanY), lw) * 0.4);

    // Altitude bar (right edge)
    float barX = 0.93;
    float barH = 0.5;
    float barBot = 0.25;
    float fill = fract(uTime * 0.1);
    float bar = step(abs(uv.x - barX), lw * 2.0) * step(barBot, uv.y) * step(uv.y, barBot + barH);
    float barFill = step(abs(uv.x - barX), lw * 5.0)
                  * step(barBot, uv.y) * step(uv.y, barBot + barH * fill) * 0.3;
    hud = max(hud, max(bar, barFill));

    col.rgb = mix(col.rgb, uColor, clamp(hud, 0.0, 1.0) * 0.9);
    outputColor = col;
  }
`

export class DroneHudEffect extends Effect {
  private _time = 0
  constructor(color = new Color('#00ff88')) {
    super('DroneHudEffect', shader, {
      uniforms: new Map([
        ['uTime',  new Uniform(0)],
        ['uColor', new Uniform(color)],
      ]) as Map<string, Uniform<number>>,
    })
  }
  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt: number) {
    this._time += dt
    ;(this.uniforms.get('uTime') as Uniform<number>).value = this._time
  }
  setColor(c: Color) { (this.uniforms.get('uColor') as Uniform<Color>).value = c }
}
