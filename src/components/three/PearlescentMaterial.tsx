import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`

const fragmentShader = /* glsl */`
uniform vec3 uBaseColor;
uniform float uShiftIntensity;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

void main() {
  float nDotV = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
  float hue = fract(nDotV * 1.5 + uTime * 0.05);
  vec3 rainbow = hsl2rgb(vec3(hue, 0.9, 0.6));
  vec3 col = mix(uBaseColor, rainbow, uShiftIntensity * (1.0 - nDotV));
  float specular = pow(nDotV, 8.0) * 0.5;
  col += specular;
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  baseColor?: string
  shiftIntensity?: number
}

export function PearlescentMaterial({ baseColor = '#f0e8ff', shiftIntensity = 0.8 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uBaseColor:      { value: new Color(baseColor) },
        uShiftIntensity: { value: shiftIntensity },
        uTime:           { value: 0 },
      }}
    />
  )
}
