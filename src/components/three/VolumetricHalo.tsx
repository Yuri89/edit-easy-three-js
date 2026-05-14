import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, ShaderMaterial, type Mesh } from 'three'

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Bright core
    float core = exp(-dist * 10.0) * 3.0;

    // Soft glow falloff
    float glow = exp(-dist * 4.0) * 1.0;

    // Radial streaks (god-ray spokes)
    float angle = atan(uv.y, uv.x);
    float rays = 0.0;
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 3.14159265 / 6.0;
      float spoke = max(0.0, cos(angle - a));
      spoke = pow(spoke, 16.0) * exp(-dist * 5.5);
      rays += spoke;
    }

    float total = (core + glow + rays * 0.45) * uIntensity;
    float alpha = clamp(total * 0.85, 0.0, 1.0);
    gl_FragColor = vec4(uColor * total, alpha);
  }
`

interface Props {
  color: string
  intensity: number
  size: number
}

export function VolumetricHalo({ color, intensity, size }: Props) {
  const ref = useRef<Mesh>(null)

  const uniforms = useMemo(() => ({
    uColor:     { value: new Color(color) },
    uIntensity: { value: intensity },
  }), [])

  // Update uniforms reactively
  useFrame(({ camera }) => {
    if (!ref.current) return
    // Billboard: align to camera
    ref.current.quaternion.copy(camera.quaternion)
    // Sync uniforms
    const mat = ref.current.material as ShaderMaterial
    mat.uniforms.uColor.value.set(color)
    mat.uniforms.uIntensity.value = intensity
  })

  return (
    <mesh ref={ref} renderOrder={999}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
