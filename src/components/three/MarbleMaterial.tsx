import { useRef } from 'react'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uVeinScale;
uniform float uVeinIntensity;
varying vec2 vUv;

${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}

void main() {
  vec2 uv = vUv * uVeinScale;
  float f1 = fbm(uv + vec2(0.0));
  float f2 = fbm(uv * 2.0 + vec2(f1 * 2.0, 0.0));
  float vein = fbm(uv + vec2(f2));
  vein = pow(abs(sin(vein * 6.28 * 2.0)), 1.0 - uVeinIntensity * 0.8);
  vec3 col = mix(uColor1, uColor2, clamp(vein, 0.0, 1.0));
  // specular highlight
  float spec = pow(clamp(1.0 - vein, 0.0, 1.0), 4.0) * 0.3;
  col += spec;
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  color1?: string
  color2?: string
  veinScale?: number
  veinIntensity?: number
}

export function MarbleMaterial({ color1 = '#e8e8e8', color2 = '#555555', veinScale = 4, veinIntensity = 0.8 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uColor1:        { value: new Color(color1) },
        uColor2:        { value: new Color(color2) },
        uVeinScale:     { value: veinScale },
        uVeinIntensity: { value: veinIntensity },
      }}
    />
  )
}
