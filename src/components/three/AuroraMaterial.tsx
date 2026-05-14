import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color, DoubleSide } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uSpeed;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uSpeed;
  // Vertical bands
  float wave1 = sin(vUv.x * 6.28 * 3.0 + t + fbm(vec2(vUv.x * 2.0, t)) * 2.0) * 0.5 + 0.5;
  float wave2 = sin(vUv.x * 6.28 * 5.0 - t * 1.3 + fbm(vec2(vUv.x * 3.0 + 1.0, t * 0.7)) * 2.0) * 0.5 + 0.5;
  // Curtain fade
  float curtain = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
  vec3 col = mix(uColor1, uColor2, wave1);
  col = mix(col, uColor3, wave2 * 0.5);
  col *= curtain;
  float alpha = (wave1 * 0.4 + wave2 * 0.3 + 0.1) * curtain;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.9));
}
`

interface Props { color1?: string; color2?: string; color3?: string; speed?: number }

export function AuroraMaterial({ color1='#00ff88', color2='#8800ff', color3='#0044ff', speed=0.3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} side={DoubleSide}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uColor3:{value:new Color(color3)}, uSpeed:{value:speed}, uTime:{value:0} }} />
  )
}
