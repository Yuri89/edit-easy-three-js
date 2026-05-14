import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
uniform float uTime;
uniform float uPulseSpeed;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  float pulse = sin(uTime * uPulseSpeed) * 0.04;
  vec3 pos = position + normal * pulse;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uPulseSpeed;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uPulseSpeed * 0.3;
  float vein = fbm(vUv * 5.0 + t);
  float pulse = sin(uTime * uPulseSpeed * 2.0) * 0.5 + 0.5;
  vec3 col = mix(uColor2, uColor1, vein);
  col = mix(col, col * 1.4, pulse * 0.4);
  float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0,0,1)), 0.0), 2.0);
  col += uColor1 * rim * 0.3;
  gl_FragColor = vec4(col, 0.92);
}
`

interface Props { color1?: string; color2?: string; pulseSpeed?: number }

export function AlienFleshMaterial({ color1='#22ff88', color2='#004422', pulseSpeed=1 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) { matRef.current.uniforms.uTime.value = clock.getElapsedTime() } })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uPulseSpeed:{value:pulseSpeed}, uTime:{value:0} }} />
  )
}
