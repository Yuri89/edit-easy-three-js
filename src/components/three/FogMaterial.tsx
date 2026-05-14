import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color, DoubleSide } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uDensity;
uniform float uSpeed;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uSpeed;
  float f = fbm(vUv * 3.0 + vec2(t * 0.2, t));
  f = f * uDensity;
  vec3 col = uColor;
  float alpha = clamp(f, 0.0, 0.85);
  gl_FragColor = vec4(col, alpha);
}
`

interface Props { color?: string; density?: number; speed?: number }

export function FogMaterial({ color='#aabbcc', density=0.5, speed=0.3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} side={DoubleSide}
      uniforms={{ uColor:{value:new Color(color)}, uDensity:{value:density}, uSpeed:{value:speed}, uTime:{value:0} }} />
  )
}
