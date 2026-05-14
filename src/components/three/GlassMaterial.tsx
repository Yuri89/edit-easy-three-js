import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ShaderMaterial, WebGLRenderTarget, LinearFilter, RGBAFormat, Color, Texture } from 'three'
import type { SceneObject } from '../../store/useStudioStore'

// ── Vertex ────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec4 vScreenPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
    vScreenPos = gl_Position;
  }
`

// ── Fragment ──────────────────────────────────────────────────────────────────
const FRAG = /* glsl */`
  uniform sampler2D uBackBuffer;
  uniform sampler2D uEmissiveMap;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uEmissiveIntensity;
  uniform float uIOR;
  uniform float uRoughness;
  uniform float uIridescence;
  uniform float uDistortion;
  uniform float uHasEmissiveMap;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec4 vScreenPos;

  vec3 iridescenceColor(float cosA, float ior) {
    float t = 0.5 + 0.5 * cos(cosA * 6.2832 * ior * 2.0);
    vec3 c1 = vec3(1.0, 0.2, 0.8);
    vec3 c2 = vec3(0.2, 0.8, 1.0);
    return mix(c1, c2, t);
  }

  void main() {
    // screen UV
    vec2 ndc = vScreenPos.xy / vScreenPos.w * 0.5 + 0.5;

    // refraction offset via normal + IOR
    float refrStr = (uIOR - 1.0) * 0.15 + uDistortion * 0.12;
    vec2 offset = vNormal.xy * refrStr;

    // chromatic abberation
    float ca = 0.003 + uDistortion * 0.006;
    float r = texture2D(uBackBuffer, ndc + offset + vec2(ca, 0.0)).r;
    float g = texture2D(uBackBuffer, ndc + offset).g;
    float b = texture2D(uBackBuffer, ndc + offset - vec2(ca, 0.0)).b;
    vec3 refracted = vec3(r, g, b);

    // tint
    refracted *= uColor;

    // fresnel
    float cosA = clamp(dot(vNormal, vViewDir), 0.0, 1.0);
    float fresnel = pow(1.0 - cosA, 4.0);

    // iridescence
    vec3 iriCol = iridescenceColor(cosA, uIOR) * uIridescence;

    // specular highlight
    vec3 spec = vec3(pow(fresnel, 2.0) * 0.6);

    vec3 col = refracted + spec + iriCol;

    // emissive / gradient
    if (uHasEmissiveMap > 0.5) {
      vec3 emTex = texture2D(uEmissiveMap, vUv).rgb;
      col += uEmissive * emTex * uEmissiveIntensity;
    } else if (uEmissiveIntensity > 0.001) {
      col += uEmissive * uEmissiveIntensity;
    }

    gl_FragColor = vec4(col, 0.85 + fresnel * 0.15);
  }
`

interface Props {
  obj: SceneObject
  color: string
  roughness: number
  iridescence: number
  emissiveColor: string
  emissiveIntensity: number
  emissiveMap: Texture | null
}

export function GlassMaterial({ obj, color, roughness, iridescence, emissiveColor, emissiveIntensity, emissiveMap }: Props) {
  const { gl, scene, camera, size } = useThree()
  const matRef = useRef<ShaderMaterial>(null!)

  const rt = useMemo(() => new WebGLRenderTarget(512, 512, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  }), [])

  const uniforms = useMemo(() => ({
    uBackBuffer:       { value: rt.texture },
    uEmissiveMap:      { value: emissiveMap },
    uResolution:       { value: [size.width, size.height] },
    uColor:            { value: new Color(color) },
    uEmissive:         { value: new Color(emissiveColor) },
    uEmissiveIntensity:{ value: emissiveIntensity },
    uIOR:              { value: obj.mat.ior },
    uRoughness:        { value: roughness },
    uIridescence:      { value: iridescence },
    uDistortion:       { value: obj.mat.distortion },
    uHasEmissiveMap:   { value: emissiveMap ? 1.0 : 0.0 },
  }), []) // eslint-disable-line

  useFrame(() => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uColor.value.set(color)
    u.uEmissive.value.set(emissiveColor)
    u.uEmissiveIntensity.value = emissiveIntensity
    u.uIOR.value = obj.mat.ior
    u.uRoughness.value = roughness
    u.uIridescence.value = iridescence
    u.uDistortion.value = obj.mat.distortion
    u.uHasEmissiveMap.value = emissiveMap ? 1.0 : 0.0
    u.uEmissiveMap.value = emissiveMap

    // render scene (excluding self) to back buffer
    const oldRT = gl.getRenderTarget()
    gl.setRenderTarget(rt)
    gl.render(scene, camera)
    gl.setRenderTarget(oldRT)
    u.uBackBuffer.value = rt.texture
  })

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={VERT}
      fragmentShader={FRAG}
      uniforms={uniforms}
      transparent
      depthWrite={false}
    />
  )
}
