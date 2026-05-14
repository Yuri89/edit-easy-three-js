import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
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
  vec2 uv = vUv * uScale;
  float t = uTime * uSpeed;
  float f = fbm(uv + t + fbm(uv * 1.5 + t * 0.7));
  float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
  vec3 col = mix(uColor1, uColor2, f);
  col = mix(col, col * 1.5, pulse * 0.3);
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props { color1?: string; color2?: string; speed?: number; scale?: number }

export function PlasmaMaterial({ color1='#ff00ff', color2='#00ffff', speed=1, scale=3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uSpeed:{value:speed}, uScale:{value:scale}, uTime:{value:0} }} />
  )
}
