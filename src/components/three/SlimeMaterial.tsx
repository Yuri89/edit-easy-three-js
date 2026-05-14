import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; varying vec3 vNormal; void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uRippleSpeed;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uRippleSpeed;
  float ripple = fbm(vUv * 6.0 + t);
  float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0,0,1)), 0.0), 2.0);
  vec3 col = uColor * (0.7 + ripple * 0.3);
  col += vec3(0.2, 0.5, 0.2) * rim;
  float alpha = 0.75 + ripple * 0.1;
  gl_FragColor = vec4(col, alpha);
}
`

interface Props { color?: string; rippleSpeed?: number }

export function SlimeMaterial({ color='#44ff44', rippleSpeed=0.8 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor:{value:new Color(color)}, uRippleSpeed:{value:rippleSpeed}, uTime:{value:0} }} />
  )
}
