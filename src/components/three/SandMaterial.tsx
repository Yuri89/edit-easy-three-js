import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { GLSL_HASH, GLSL_NOISE, GLSL_FBM } from '../../utils/glslNoise'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uRippleScale;
uniform float uWindSpeed;
uniform float uTime;
varying vec2 vUv;
${GLSL_HASH}
${GLSL_NOISE}
${GLSL_FBM}
void main() {
  float t = uTime * uWindSpeed;
  vec2 uv = vUv * uRippleScale;
  // dune ripples
  float ripple = sin((uv.x + fbm(uv + t) * 0.5) * 20.0) * 0.5 + 0.5;
  ripple = pow(ripple, 3.0);
  // shadow
  float shadow = fbm(uv * 0.5 + vec2(t * 0.3, 0.0)) * 0.4;
  vec3 dark = uColor * 0.6;
  vec3 col = mix(dark, uColor, ripple);
  col = mix(col, uColor * 1.2, shadow);
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props { color?: string; rippleScale?: number; windSpeed?: number }

export function SandMaterial({ color='#c2b280', rippleScale=5, windSpeed=0.4 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      uniforms={{ uColor:{value:new Color(color)}, uRippleScale:{value:rippleScale}, uWindSpeed:{value:windSpeed}, uTime:{value:0} }} />
  )
}
