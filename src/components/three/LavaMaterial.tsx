import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uScale;
varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = vUv * uScale;
  float t = uTime * 0.3;
  float f = fbm(uv + t + fbm(uv + fbm(uv + t)));
  vec3 col = mix(uColor2, uColor1, clamp(f * 1.5, 0.0, 1.0));
  float rim = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
  col += uColor1 * rim * 0.6;
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  color1?: string
  color2?: string
  speed?: number
  scale?: number
}

export function LavaMaterial({ color1 = '#ff4400', color2 = '#220000', speed = 1, scale = 3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime() * speed
    }
  })

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
        uColor1: { value: new Color(color1) },
        uColor2: { value: new Color(color2) },
        uScale: { value: scale },
      }}
    />
  )
}
