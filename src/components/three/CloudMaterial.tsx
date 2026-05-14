import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color, DoubleSide } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uSpeed;
uniform float uOpacity;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uSpeed;
  float f1 = fbm(vUv * 3.0 + vec2(t, 0.0));
  float f2 = fbm(vUv * 5.0 + vec2(0.0, t * 0.7) + f1);
  float cloud = f1 * f2 * 2.0;
  cloud = clamp(cloud, 0.0, 1.0);
  // edge fade
  vec2 edge = abs(vUv - 0.5) * 2.0;
  float fade = 1.0 - pow(max(edge.x, edge.y), 3.0);
  vec3 col = mix(uColor * 0.7, uColor, cloud);
  float alpha = cloud * uOpacity * fade;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`

interface Props { color?: string; speed?: number; opacity?: number }

export function CloudMaterial({ color='#ffffff', speed=0.2, opacity=0.85 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} side={DoubleSide}
      uniforms={{ uColor:{value:new Color(color)}, uSpeed:{value:speed}, uOpacity:{value:opacity}, uTime:{value:0} }} />
  )
}
