import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpeed;
uniform float uDistortion;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  vec2 centered = vUv - 0.5;
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);
  float t = uTime * uSpeed;
  float swirl = angle + radius * 8.0 * uDistortion - t * 3.0;
  float f = fbm(vec2(swirl, radius * 4.0) + t);
  float ring = smoothstep(0.0, 0.02, radius) * smoothstep(0.5, 0.48, radius);
  vec3 col = mix(uColor1, uColor2, f);
  col *= ring;
  col += uColor1 * (1.0 - radius * 2.0) * smoothstep(0.0, 0.1, radius);
  float alpha = ring * (0.7 + f * 0.3);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`

interface Props { color1?: string; color2?: string; speed?: number; distortion?: number }

export function PortalMaterial({ color1='#7700ff', color2='#00ccff', speed=1, distortion=0.5 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uSpeed:{value:speed}, uDistortion:{value:distortion}, uTime:{value:0} }} />
  )
}
