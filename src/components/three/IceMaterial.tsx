import { useRef } from 'react'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM, GLSL_VORONOI } from '../../utils/glslNoise'

const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uCrackIntensity;
uniform float uFrost;
varying vec2 vUv;
varying vec3 vNormal;

${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
${GLSL_VORONOI}

void main() {
  vec2 uv = vUv * 5.0;
  vec2 vor = voronoi(uv);
  float crack = smoothstep(0.0, 0.05 * uCrackIntensity, vor.x);
  float frost = fbm(vUv * 8.0) * uFrost;
  // rim
  float rim = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
  rim = pow(rim, 2.0);
  vec3 iceCol = uColor + rim * 0.3 + frost * 0.1;
  vec3 crackCol = mix(vec3(0.0, 0.2, 0.4), iceCol, crack);
  float alpha = mix(0.85, 0.6, frost);
  gl_FragColor = vec4(crackCol, alpha);
}
`

interface Props {
  color?: string
  crackIntensity?: number
  frost?: number
}

export function IceMaterial({ color = '#a8d8ea', crackIntensity = 0.6, frost = 0.3 }: Props) {
  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      depthWrite={false}
      uniforms={{
        uColor:          { value: new Color(color) },
        uCrackIntensity: { value: crackIntensity },
        uFrost:          { value: frost },
      }}
    />
  )
}
