import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2, Vector3, Color, ShaderMaterial } from 'three'
import { useStudioStore } from '../../store/useStudioStore'
import { PostFXPasses } from './PostFXPasses'

// ─── Backdrop shaders ─────────────────────────────────────────────────────────

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */`
  uniform float uAspect;
  uniform float uMode;    // 0 = blobs, 1 = solid, 2 = gradient
  uniform vec3  uColor1;  // solid / gradient top
  uniform vec3  uColor2;  // gradient bottom
  // Blob positions pre-computed on CPU each frame
  uniform vec2 uB1; uniform vec2 uB2; uniform vec2 uB3;
  uniform vec2 uB4; uniform vec2 uB5; uniform vec2 uB6;
  varying vec2 vUv;

  void main() {
    vec3 col;

    if (uMode < 0.5) {
      // --- Blobs (positions come from CPU uniforms) ---
      vec2 uv = vec2(vUv.x * uAspect, vUv.y);
      col = vec3(0.03, 0.03, 0.10);
      col += vec3(0.92,0.0, 0.36)*exp(-dot(uv-uB1,uv-uB1)*2.2);
      col += vec3(0.0, 0.40,1.0 )*exp(-dot(uv-uB2,uv-uB2)*1.9);
      col += vec3(0.67,0.0, 1.0 )*exp(-dot(uv-uB3,uv-uB3)*2.8);
      col += vec3(0.0, 0.83,0.67)*exp(-dot(uv-uB4,uv-uB4)*2.5);
      col += vec3(1.0, 0.67,0.0 )*exp(-dot(uv-uB5,uv-uB5)*3.2);
      col += vec3(0.20,0.10,0.55)*exp(-dot(uv-uB6,uv-uB6)*1.6);

    } else if (uMode < 1.5) {
      // --- Solid color ---
      col = uColor1;

    } else {
      // --- Vertical gradient: uColor1 top → uColor2 bottom ---
      col = mix(uColor2, uColor1, vUv.y);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`

// Reusable Color objects to avoid per-frame heap allocations
const _c1 = new Color()
const _c2 = new Color()

/** Full-screen backdrop — reads scene settings from Zustand store. */
function Backdrop() {
  const matRef = useRef<ShaderMaterial>(null)
  const scene = useStudioStore(s => s.scene)
  const sceneRef = useRef(scene)
  sceneRef.current = scene

  const uniforms = useMemo(() => ({
    uAspect: { value: window.innerWidth / window.innerHeight },
    uMode:   { value: 0 },
    uColor1: { value: new Vector3(1, 0, 0.22) },
    uColor2: { value: new Vector3(0, 0.27, 0.8) },
    uB1: { value: new Vector2() }, uB2: { value: new Vector2() },
    uB3: { value: new Vector2() }, uB4: { value: new Vector2() },
    uB5: { value: new Vector2() }, uB6: { value: new Vector2() },
  }), [])

  useFrame(({ clock }) => {
    const mat = matRef.current
    if (!mat) return
    const c = sceneRef.current
    mat.uniforms.uMode.value =
      c.bgMode === 'Solid' ? 1 : c.bgMode === 'Gradient' ? 2 : 0
    _c1.set(c.bgColor1)
    _c2.set(c.bgColor2)
    mat.uniforms.uColor1.value.set(_c1.r, _c1.g, _c1.b)
    mat.uniforms.uColor2.value.set(_c2.r, _c2.g, _c2.b)
    if (c.bgMode === 'Blobs') {
      const t = clock.elapsedTime
      const a = mat.uniforms.uAspect.value
      mat.uniforms.uB1.value.set((0.18 + Math.sin(t*0.31)*0.07)*a, 0.72+Math.cos(t*0.19)*0.06)
      mat.uniforms.uB2.value.set((0.80 + Math.cos(t*0.23)*0.07)*a, 0.30+Math.sin(t*0.27)*0.06)
      mat.uniforms.uB3.value.set((0.50 + Math.sin(t*0.17)*0.05)*a, 0.80+Math.cos(t*0.41)*0.05)
      mat.uniforms.uB4.value.set((0.15 + Math.cos(t*0.37)*0.06)*a, 0.28+Math.sin(t*0.29)*0.07)
      mat.uniforms.uB5.value.set((0.85 + Math.sin(t*0.22)*0.05)*a, 0.76+Math.cos(t*0.33)*0.05)
      mat.uniforms.uB6.value.set((0.50 + Math.cos(t*0.14)*0.10)*a, 0.44+Math.sin(t*0.38)*0.08)
    }
  })

  return (
    <mesh position={[0, 0, -8]} frustumCulled={false}>
      <planeGeometry args={[60, 34]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export function SceneSetup({ orbitEnabled }: { orbitEnabled: boolean }) {
  const scene = useStudioStore(s => s.scene)
  const caOffset = useMemo(() => new Vector2(), [])
  caOffset.set(
    scene.chromaticAberration * 0.01,
    scene.chromaticAberration * 0.008,
  )

  return (
    <>
      <Backdrop />

      {scene.hdri !== 'None' && <Environment preset={scene.hdri as 'city'} />}

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 3, 2]} intensity={0.8} color="#7b61ff" />
      <pointLight position={[4, -2, 3]} intensity={0.6} color="#ff61b6" />

      <OrbitControls
        enabled={orbitEnabled}
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
      />

      <EffectComposer multisampling={0}>
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={caOffset}
          radialModulation={false}
          modulationOffset={0}
        />
        <Bloom
          luminanceThreshold={scene.bloomThreshold}
          luminanceSmoothing={0.3}
          intensity={scene.bloomEnabled ? scene.bloomIntensity : 0}
        />
        {/* ── Camera Post-FX ── */}
        <PostFXPasses />
      </EffectComposer>
    </>
  )
}
