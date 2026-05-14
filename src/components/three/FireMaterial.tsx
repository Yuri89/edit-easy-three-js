import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color, DoubleSide } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpeed;
uniform float uScale;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  vec2 uv = vec2(vUv.x * uScale, (1.0 - vUv.y) * uScale);
  float t = uTime * uSpeed;
  // flames rise upward
  float f = fbm(uv + vec2(fbm(uv + t) * 0.5, t));
  float alpha = smoothstep(0.0, 0.3, f) * smoothstep(1.0, 0.6, vUv.y) * f;
  vec3 col = mix(uColor1, uColor2, clamp(1.0 - f * 1.5, 0.0, 1.0));
  col = mix(vec3(1.0, 1.0, 0.8), col, clamp(f, 0.0, 1.0));
  gl_FragColor = vec4(col * (alpha + 0.1), clamp(alpha * 1.5, 0.0, 1.0));
}
`

interface Props { color1?: string; color2?: string; speed?: number; scale?: number }

export function FireMaterial({ color1='#ffdd00', color2='#ff2200', speed=1.2, scale=3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} side={DoubleSide}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uSpeed:{value:speed}, uScale:{value:scale}, uTime:{value:0} }} />
  )
}
