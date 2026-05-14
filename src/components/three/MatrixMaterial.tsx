import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uSpeed;
uniform float uDensity;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }

void main() {
  // Grid of falling columns
  float cols = floor(uDensity * 30.0);
  float col = floor(vUv.x * cols);
  float row = vUv.y;

  // Each column has a random offset and speed
  float colHash = hash(vec2(col, 0.0));
  float scroll = fract(row + uTime * uSpeed * (0.5 + colHash * 1.5));
  
  // Character cell
  float charH = 1.0 / 20.0;
  float cellY = fract(scroll / charH);
  float charVal = hash(vec2(col, floor(scroll / charH)));
  
  // Brightness: head of stream is bright, fades down
  float brightness = pow(1.0 - scroll, 2.0);
  brightness += step(0.97, charVal) * 2.0; // random bright flashes
  
  // Symbol shape (simple cross/dot pattern)
  vec2 cellUv = vec2(fract(vUv.x * cols), cellY);
  float sym = step(0.15, cellUv.x) * step(cellUv.x, 0.85) * step(0.1, cellUv.y) * step(cellUv.y, 0.9);
  // horizontal bar variation
  sym *= mix(1.0, step(0.4, cellUv.y) * step(cellUv.y, 0.6) + step(0.1,cellUv.y)*step(cellUv.y,0.9)*step(0.2,cellUv.x)*step(cellUv.x,0.8), hash(vec2(col, floor(scroll/charH)*7.0)));
  
  vec3 colFinal = uColor * brightness * sym;
  float alpha = clamp(sym * brightness * 1.5, 0.0, 1.0);
  gl_FragColor = vec4(colFinal, alpha);
}
`

interface Props { color?: string; speed?: number; density?: number }

export function MatrixMaterial({ color='#00ff41', speed=1.5, density=0.5 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime() })
  return (
    <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false}
      uniforms={{ uColor:{value:new Color(color)}, uSpeed:{value:speed}, uDensity:{value:density}, uTime:{value:0} }} />
  )
}
