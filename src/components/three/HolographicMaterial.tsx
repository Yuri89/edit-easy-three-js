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
uniform float uScanSpeed;
uniform float uStripeCount;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

void main() {
  float nDotV = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
  // rainbow by angle
  float hue = fract(nDotV + uTime * 0.03);
  vec3 rainbow = hsl2rgb(vec3(hue, 1.0, 0.5));
  // scan lines
  float scan = fract(vUv.y * uStripeCount - uTime * uScanSpeed);
  scan = smoothstep(0.0, 0.05, scan) * smoothstep(1.0, 0.95, scan);
  vec3 col = mix(rainbow, uColor, 0.3);
  col += scan * 0.4;
  float rim = pow(1.0 - nDotV, 2.0) * 0.5;
  col += rim;
  float alpha = mix(0.7, 0.95, nDotV);
  gl_FragColor = vec4(col, alpha);
}
`

interface Props {
  color?: string
  scanSpeed?: number
  stripeCount?: number
}

export function HolographicMaterial({ color = '#00ffff', scanSpeed = 1, stripeCount = 20 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      depthWrite={false}
      uniforms={{
        uColor:       { value: new Color(color) },
        uScanSpeed:   { value: scanSpeed },
        uStripeCount: { value: stripeCount },
        uTime:        { value: 0 },
      }}
    />
  )
}
