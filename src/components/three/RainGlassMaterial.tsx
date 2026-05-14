import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform float uIntensity;
uniform float uSpeed;
uniform float uDropSize;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }

float drop(vec2 uv, float t) {
  vec2 cell = floor(uv);
  vec2 f = fract(uv);
  float h = hash(cell);
  float dropT = fract(t * (0.5 + h * 0.8) + h);
  vec2 center = vec2(0.5, dropT);
  float d = length((f - center) * vec2(1.0, 0.3 / uDropSize));
  float drop = smoothstep(0.08 * uDropSize, 0.0, d);
  // trail
  float trail = step(f.y, dropT) * step(dropT - 0.4, f.y);
  trail *= smoothstep(0.03, 0.0, abs(f.x - 0.5)) * (1.0 - dropT) * 0.5;
  return drop + trail;
}

void main() {
  float t = uTime * uSpeed;
  vec2 uv = vUv * vec2(8.0, 14.0) * uDropSize;
  float d1 = drop(uv, t);
  float d2 = drop(uv * 0.7 + vec2(3.1, 1.7), t * 0.9);
  float d3 = drop(uv * 1.3 + vec2(1.5, 4.2), t * 1.1);
  float total = (d1 + d2 + d3) * uIntensity;
  // distortion color: slight blue tint
  vec3 col = vec3(0.7, 0.85, 1.0) * total;
  float alpha = clamp(total * 0.8, 0.0, 0.9);
  gl_FragColor = vec4(col, alpha);
}
`

interface Props { intensity?: number; speed?: number; dropSize?: number }

export function RainGlassMaterial({ intensity=0.7, speed=0.8, dropSize=1 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uIntensity:{value:intensity}, uSpeed:{value:speed}, uDropSize:{value:dropSize}, uTime:{value:0} }} />
  )
}
