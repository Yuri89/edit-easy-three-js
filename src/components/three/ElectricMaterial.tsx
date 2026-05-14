import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_VORONOI } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; varying vec3 vNormal; void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uIntensity;
uniform float uSpeed;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_VORONOI}
void main() {
  float t = uTime * uSpeed;
  vec2 uv = vUv * 8.0;
  vec2 vor = voronoi(uv + t);
  float bolt = 1.0 - smoothstep(0.0, 0.04, vor.x);
  bolt += 1.0 - smoothstep(0.0, 0.02, voronoi(uv * 2.0 - t * 0.5).x);
  float flicker = hash(vec2(floor(t * 10.0), 0.0)) * 0.5 + 0.5;
  float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0,0,1)), 0.0), 3.0);
  vec3 col = uColor * bolt * uIntensity * flicker;
  col += uColor * rim * 0.5;
  float alpha = clamp(bolt * uIntensity + rim * 0.3, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

interface Props { color?: string; intensity?: number; speed?: number }

export function ElectricMaterial({ color='#88aaff', intensity=1, speed=2 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor:{value:new Color(color)}, uIntensity:{value:intensity}, uSpeed:{value:speed}, uTime:{value:0} }} />
  )
}
