import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uHexSize;
uniform float uPulseSpeed;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

// Hex grid
vec2 hexCoord(vec2 uv, float size) {
  uv *= size;
  vec2 s = vec2(1.732, 1.0);
  vec2 p = mod(uv, s) - s * 0.5;
  vec2 q = mod(uv + s * 0.5, s) - s * 0.5;
  return dot(p, p) < dot(q, q) ? p : q;
}

void main() {
  vec2 hc = hexCoord(vUv, uHexSize);
  float hexDist = length(hc);
  float hexEdge = smoothstep(0.42, 0.45, hexDist);
  float hexInner = 1.0 - smoothstep(0.3, 0.42, hexDist);
  float pulse = sin(uTime * uPulseSpeed + length(vUv - 0.5) * 8.0) * 0.5 + 0.5;
  // fresnel
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.0);
  vec3 col = uColor * (hexEdge + pulse * 0.3 + fresnel * 0.5);
  float alpha = hexEdge * 0.9 + fresnel * 0.4 + pulse * hexInner * 0.1;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`

interface Props { color?: string; hexSize?: number; pulseSpeed?: number }

export function ForceFieldMaterial({ color='#00ffaa', hexSize=8, pulseSpeed=1 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor:{value:new Color(color)}, uHexSize:{value:hexSize}, uPulseSpeed:{value:pulseSpeed}, uTime:{value:0} }} />
  )
}
