import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_VORONOI } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; varying vec3 vNormal; void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uRockColor;
uniform vec3 uCrackColor;
uniform float uGlow;
uniform float uSpeed;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_VORONOI}
void main() {
  vec2 vor = voronoi(vUv * 5.0);
  float crack = 1.0 - smoothstep(0.0, 0.08, vor.x);
  float heat = pow(crack, 2.0) * (sin(uTime * uSpeed + vor.y * 10.0) * 0.5 + 0.5);
  vec3 col = mix(uRockColor, uCrackColor * uGlow, heat);
  col += uCrackColor * crack * uGlow * 0.3;
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props { rockColor?: string; crackColor?: string; glow?: number; speed?: number }

export function MagmaRockMaterial({ rockColor='#222222', crackColor='#ff6600', glow=1.5, speed=0.5 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      uniforms={{ uRockColor:{value:new Color(rockColor)}, uCrackColor:{value:new Color(crackColor)}, uGlow:{value:glow}, uSpeed:{value:speed}, uTime:{value:0} }} />
  )
}
