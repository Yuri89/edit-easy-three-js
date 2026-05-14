import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'

const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
uniform float uTime;
uniform float uRipple;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  float wave = sin(position.x * 8.0 + uTime * 3.0) * sin(position.z * 8.0 + uTime * 2.0) * uRipple * 0.015;
  vec3 pos = position + normal * wave;
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform vec3 uCamPos;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 viewDir = normalize(uCamPos - vWorldPos);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);
  vec3 col = uColor + vec3(fresnel * 0.6);
  // subtle iridescent shift
  float iri = sin(fresnel * 12.0) * 0.08;
  col += vec3(iri, iri * 0.5, iri * 0.2);
  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  color?: string
  ripple?: number
}

export function MercuryMaterial({ color = '#999999', ripple = 0.3 }: Props) {
  const matRef = useRef<ShaderMaterial>(null)
  useFrame(({ clock, camera }) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    matRef.current.uniforms.uCamPos.value = camera.position
    matRef.current.uniforms.uRipple.value = ripple
  })
  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime:   { value: 0 },
        uColor:  { value: new Color(color) },
        uCamPos: { value: [0, 0, 5] },
        uRipple: { value: ripple },
      }}
    />
  )
}
