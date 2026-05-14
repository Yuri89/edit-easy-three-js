import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform float uTime;
uniform vec3 uColor;
uniform float uScanlines;
uniform float uNoise;
uniform float uBrightness;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 colorBar(float x) {
  int idx = int(x * 7.0);
  if (idx == 0) return vec3(1.0, 1.0, 1.0);
  if (idx == 1) return vec3(1.0, 1.0, 0.0);
  if (idx == 2) return vec3(0.0, 1.0, 1.0);
  if (idx == 3) return vec3(0.0, 1.0, 0.0);
  if (idx == 4) return vec3(1.0, 0.0, 1.0);
  if (idx == 5) return vec3(1.0, 0.0, 0.0);
  return vec3(0.0, 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;

  // CRT screen curve
  vec2 curved = uv - 0.5;
  float r2 = dot(curved, curved);
  curved += curved * r2 * 0.08;
  curved += 0.5;
  float edge = step(0.0, curved.x) * step(curved.x, 1.0)
             * step(0.0, curved.y) * step(curved.y, 1.0);

  // Scanlines
  float scan = sin(curved.y * uScanlines * 3.14159) * 0.5 + 0.5;
  scan = pow(scan, 0.4);

  // Color bars
  vec3 bars = colorBar(curved.x);
  vec3 col = mix(bars, uColor, 0.45);

  // Flickering noise
  float n = hash(curved + fract(uTime * 17.0)) * uNoise;
  col += n;

  // Horizontal roll artifact
  float roll = sin(curved.y * 50.0 + uTime * 3.0) * 0.005;
  col.r += roll;

  col *= scan * uBrightness * edge;

  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  color?: string
  scanlines?: number
  noise?: number
  brightness?: number
}

export function TVScreenMaterial({ color = '#00ff88', scanlines = 120, noise = 0.05, brightness = 1.2 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
        uColor: { value: new Color(color) },
        uScanlines: { value: scanlines },
        uNoise: { value: noise },
        uBrightness: { value: brightness },
      }}
    />
  )
}
