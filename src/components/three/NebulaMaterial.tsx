import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
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
  float f1 = fbm(vUv * 3.0 + vec2(t, 0.0));
  float f2 = fbm(vUv * 5.0 + vec2(0.0, t * 0.7));
  float f3 = fbm(vUv * 2.0 + vec2(t * 0.3, t * 0.5));
  vec3 col = mix(uColor1, uColor2, f1);
  col = mix(col, uColor3, f2 * 0.5);
  col += f3 * 0.2;
  float stars = step(0.98, hash(vUv * 300.0 + floor(t)));
  col += stars * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props { color1?: string; color2?: string; color3?: string; speed?: number }

export function NebulaMaterial({ color1='#ff4488', color2='#4400ff', color3='#00ffcc', speed=0.2 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      uniforms={{ uColor1:{value:new Color(color1)}, uColor2:{value:new Color(color2)}, uColor3:{value:new Color(color3)}, uSpeed:{value:speed}, uTime:{value:0} }} />
  )
}
