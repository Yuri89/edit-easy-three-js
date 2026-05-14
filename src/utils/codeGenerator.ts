import type { SceneObject, SceneSettings, CameraSettings } from '../store/useStudioStore'

const GEO: Record<string, string> = {
  sphere:   '<sphereGeometry args={[0.9, 24, 24]} />',
  torus:    '<torusGeometry args={[0.7, 0.28, 16, 48]} />',
  cylinder: '<cylinderGeometry args={[0.6, 0.6, 1.4, 32]} />',
  plane:    '<planeGeometry args={[1.6, 1.6]} />',
}

function fmt(n: number) { return n.toFixed(3) }
function fmtVec(v: [number, number, number]) { return `[${v.map(fmt).join(', ')}]` }

function matProps(obj: SceneObject) {
  const m = obj.mat
  return [
    '      transmissionSampler',
    '      backside',
    `      transmission={${fmt(m.transmission)}}`,
    `      roughness={${fmt(m.roughness)}}`,
    `      ior={${fmt(m.ior)}}`,
    `      thickness={${fmt(m.thickness)}}`,
    `      iridescence={${fmt(m.iridescence)}}`,
    `      iridescenceIOR={1.3}`,
    `      iridescenceThicknessRange={[0, 1400]}`,
    `      envMapIntensity={${fmt(m.envMapIntensity)}}`,
    `      color="${m.color}"`,
    ...(m.lightEnabled || m.gradientEnabled ? [
      `      emissive="${m.emissiveColor}"`,
      `      emissiveIntensity={${fmt(m.emissiveIntensity)}}`,
    ] : []),
  ].join('\n')
}

function gradientMapVar(obj: SceneObject): string {
  if (!obj.mat.gradientEnabled) return ''
  const m = obj.mat
  const stopsJson = JSON.stringify(m.gradientStops)
  return `  const gradMap_${obj.id.replace(/\W/g, '_')} = useGradientTexture(${stopsJson}, ${m.gradientAngle})\n`
}

function objectCode(obj: SceneObject, idx: number): string {
  const pos = fmtVec(obj.position)
  const rot = fmtVec(obj.rotation)
  const scl = fmtVec(obj.scale)
  const comment = `  {/* ${obj.name} */}`
  const isLight = obj.mat.lightEnabled
  const mapProp = obj.mat.gradientEnabled
    ? `\n      emissiveMap={gradMap_${obj.id.replace(/\W/g, '_')}}`
    : ''
  const pointLightCode = isLight
    ? `\n  <pointLight position={${pos}} color="${obj.mat.lightColor}" intensity={${fmt(obj.mat.lightIntensity)}} distance={${fmt(obj.mat.lightDistance)}} />`
    : ''

  const haloCode = isLight && obj.mat.godRays
    ? `\n  <group position={${pos}}><VolumetricHalo color="${obj.mat.godRaysColor}" intensity={${fmt(obj.mat.godRaysIntensity)}} size={${fmt(obj.mat.godRaysSize)}} /></group>`
    : ''

  if (obj.type === 'text') {
    return `${comment}
  <Center position={${pos}} rotation={${rot}} scale={${scl}}>
    <Text3D
      font="/fonts/helvetiker_bold.typeface.json"
      size={${fmt(obj.textSize ?? 0.6)}}
      height={${fmt(obj.textDepth ?? 0.2)}}
      curveSegments={8}
      bevelEnabled
      bevelThickness={0.02}
      bevelSize={0.01}
    >
      ${JSON.stringify(obj.textContent ?? 'Text')}
      <MeshTransmissionMaterial
${matProps(obj)}${mapProp}
      />
    </Text3D>
  </Center>${pointLightCode}${haloCode}`
  }

  if (obj.type === 'cube') {
    return `${comment}
  <RoundedBox
    args={[1.4, 1.4, 1.4]}
    radius={0.15}
    smoothness={4}
    position={${pos}}
    rotation={${rot}}
    scale={${scl}}
  >
    <MeshTransmissionMaterial
${matProps(obj)}${mapProp}
    />
  </RoundedBox>${pointLightCode}${haloCode}`
  }

  if (obj.type === 'glb') {
    return `${comment}
  {/* GLB: ${obj.name} — replace 'your-model.glb' with actual path */}
  <GlbGlassModel
    url="your-model.glb"
    position={${pos}}
    rotation={${rot}}
    scale={${scl}}
    mat={${JSON.stringify(obj.mat, null, 6)}}
  />`
  }

  const geo = GEO[obj.type] ?? '<sphereGeometry args={[1, 24, 24]} />'
  return `${comment}
  <mesh
    position={${pos}}
    rotation={${rot}}
    scale={${scl}}
  >
    ${geo}
    <MeshTransmissionMaterial
${matProps(obj)}${mapProp}
    />
  </mesh>${pointLightCode}${haloCode}`
}

export function generatePackageJson(_objects: SceneObject[]): string {
  const deps = {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    '@react-three/fiber': '^8.17.10',
    '@react-three/drei': '^9.117.3',
    '@react-three/postprocessing': '^2.16.2',
    'postprocessing': '^6.36.3',
    'three': '^0.171.0',
  }

  const devDeps = {
    'vite': '^6.3.5',
    '@vitejs/plugin-react': '^4.4.1',
    'typescript': '^5.7.2',
    '@types/react': '^18.3.18',
    '@types/react-dom': '^18.3.5',
    '@types/three': '^0.171.0',
  }

  return JSON.stringify({ dependencies: deps, devDependencies: devDeps }, null, 2)
}

export function generateInstallInstructions(): string {
  const deps = [
    'react@^18.3.1',
    'react-dom@^18.3.1',
    '@react-three/fiber@^8.17.10',
    '@react-three/drei@^9.117.3',
    '@react-three/postprocessing@^2.16.2',
    'postprocessing@^6.36.3',
    'three@^0.171.0',
  ]

  const devDeps = [
    'vite@^6.3.5',
    '@vitejs/plugin-react@^4.4.1',
    'typescript@^5.7.2',
    '@types/react@^18.3.18',
    '@types/react-dom@^18.3.5',
    '@types/three@^0.171.0',
  ]

  const individualDeps = deps.map(p => `npm install ${p}`).join('\n')
  const individualDevDeps = devDeps.map(p => `npm install -D ${p}`).join('\n')
  const stripVer = (p: string) => p.split('@^')[0]
  const allAtOnce = `npm install ${deps.join(' ')}\nnpm install -D ${devDeps.join(' ')}\n\n# Sem versão:\nnpm install ${deps.map(stripVer).join(' ')}\nnpm install -D ${devDeps.map(stripVer).join(' ')}`

  return `# 1. Create project
npm create vite@latest glass-scene -- --template react-ts
cd glass-scene

# 2. Dependencies (individual)
${individualDeps}

# 3. Dev dependencies (individual)
${individualDevDeps}

# 4. All at once
${allAtOnce}

# 5. Replace src/App.tsx with the exported JSX code, then:
npm run dev`
}

export function generateCode(objects: SceneObject[], scene: SceneSettings, camera: CameraSettings): string {
  const visibleObjs = objects.filter(o => o.visible)
  const hasGlb = visibleObjs.some(o => o.type === 'glb')
  const hasCube = visibleObjs.some(o => o.type === 'cube')
  const hasHalo = visibleObjs.some(o => o.mat.lightEnabled && o.mat.godRays)
  const hasGradient = visibleObjs.some(o => o.mat.gradientEnabled)
  const hasText = visibleObjs.some(o => o.type === 'text')
  const hasPostFX = scene.bloomEnabled || scene.chromaticAberration > 0

  const dreiImports = ['MeshTransmissionMaterial', 'Environment',
    hasGlb ? 'useGLTF' : '', hasCube ? 'RoundedBox' : '',
    hasText ? 'Text3D' : '', hasText ? 'Center' : '']
    .filter(Boolean).join(', ')

  const imports = [
    `import { useRef, useMemo, useEffect, Suspense } from 'react'`,
    `import { Canvas, useFrame } from '@react-three/fiber'`,
    `import { CanvasTexture, SRGBColorSpace, AdditiveBlending, Color, Vector2, ShaderMaterial } from 'three'`,
    `import { ${dreiImports} } from '@react-three/drei'`,
    ...(hasPostFX ? [
      `import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'`,
      `import { BlendFunction } from 'postprocessing'`,
    ] : []),
  ].join('\n')

  // ── Backdrop ────────────────────────────────────────────────────────────────
  const bgModeNum = scene.bgMode === 'Solid' ? 1 : scene.bgMode === 'Gradient' ? 2 : 0
  const c1Hex = scene.bgColor1
  const c2Hex = scene.bgColor2
  const backdropCode = `
// ─── Backdrop ────────────────────────────────────────────────────────────────
const BG_VERT = \`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }\`
const BG_FRAG = \`
  uniform float uAspect; uniform float uMode;
  uniform vec3 uColor1; uniform vec3 uColor2;
  uniform vec2 uB1,uB2,uB3,uB4,uB5,uB6;
  varying vec2 vUv;
  void main(){
    vec3 col;
    if(uMode<0.5){
      vec2 uv=vec2(vUv.x*uAspect,vUv.y);
      col=vec3(0.03,0.03,0.10);
      col+=vec3(0.92,0.0,0.36)*exp(-dot(uv-uB1,uv-uB1)*2.2);
      col+=vec3(0.0,0.40,1.0)*exp(-dot(uv-uB2,uv-uB2)*1.9);
      col+=vec3(0.67,0.0,1.0)*exp(-dot(uv-uB3,uv-uB3)*2.8);
      col+=vec3(0.0,0.83,0.67)*exp(-dot(uv-uB4,uv-uB4)*2.5);
      col+=vec3(1.0,0.67,0.0)*exp(-dot(uv-uB5,uv-uB5)*3.2);
      col+=vec3(0.20,0.10,0.55)*exp(-dot(uv-uB6,uv-uB6)*1.6);
    } else if(uMode<1.5){
      col=uColor1;
    } else {
      col=mix(uColor2,uColor1,vUv.y);
    }
    gl_FragColor=vec4(col,1.0);
  }
\`

const _c1=new Color(); const _c2=new Color()
function Backdrop() {
  const matRef = useRef(null)
  const uniforms = useMemo(() => ({
    uAspect:{value:window.innerWidth/window.innerHeight},
    uMode:{value:${bgModeNum}},
    uColor1:{value:new Color('${c1Hex}')},
    uColor2:{value:new Color('${c2Hex}')},
    uB1:{value:new Vector2()},uB2:{value:new Vector2()},
    uB3:{value:new Vector2()},uB4:{value:new Vector2()},
    uB5:{value:new Vector2()},uB6:{value:new Vector2()},
  }), [])
  useFrame(({ clock }) => {
    const mat = matRef.current
    if (!mat) return
    ${scene.bgMode === 'Blobs' ? `const t=clock.elapsedTime; const a=mat.uniforms.uAspect.value
    mat.uniforms.uB1.value.set((0.18+Math.sin(t*0.31)*0.07)*a,0.72+Math.cos(t*0.19)*0.06)
    mat.uniforms.uB2.value.set((0.80+Math.cos(t*0.23)*0.07)*a,0.30+Math.sin(t*0.27)*0.06)
    mat.uniforms.uB3.value.set((0.50+Math.sin(t*0.17)*0.05)*a,0.80+Math.cos(t*0.41)*0.05)
    mat.uniforms.uB4.value.set((0.15+Math.cos(t*0.37)*0.06)*a,0.28+Math.sin(t*0.29)*0.07)
    mat.uniforms.uB5.value.set((0.85+Math.sin(t*0.22)*0.05)*a,0.76+Math.cos(t*0.33)*0.05)
    mat.uniforms.uB6.value.set((0.50+Math.cos(t*0.14)*0.10)*a,0.44+Math.sin(t*0.38)*0.08)` : '// static background'}
  })
  return (
    <mesh position={[0,0,-8]} frustumCulled={false}>
      <planeGeometry args={[60,34]} />
      <shaderMaterial ref={matRef} uniforms={uniforms}
        vertexShader={BG_VERT} fragmentShader={BG_FRAG}
        depthWrite={false} depthTest={false} />
    </mesh>
  )
}`

  // ── PostFX ──────────────────────────────────────────────────────────────────
  const postFXCode = hasPostFX ? `
  <EffectComposer>
    ${scene.bloomEnabled ? `<Bloom intensity={${fmt(scene.bloomIntensity)}} luminanceThreshold={${fmt(scene.bloomThreshold)}} />` : ''}
    ${scene.chromaticAberration > 0 ? `<ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[${fmt(scene.chromaticAberration * 0.01)}, ${fmt(scene.chromaticAberration * 0.008)}]} />` : ''}
  </EffectComposer>` : ''

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const gradientHelper = hasGradient ? `
function useGradientTexture(stops, angleDeg) {
  const stopsKey = stops.map(s => s.position + ':' + s.color).join('|')
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    const rad = (angleDeg * Math.PI) / 180
    const cx = size / 2, cy = size / 2, r = size / 2
    const grad = ctx.createLinearGradient(cx-Math.cos(rad)*r, cy-Math.sin(rad)*r, cx+Math.cos(rad)*r, cy+Math.sin(rad)*r)
    const sorted = [...stops].sort((a,b)=>a.position-b.position)
    sorted.forEach(s => grad.addColorStop(Math.max(0,Math.min(1,s.position)),s.color))
    ctx.fillStyle = grad; ctx.fillRect(0,0,size,size)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopsKey, angleDeg])
  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}` : ''

  const haloHelper = hasHalo ? `
const HALO_VERT=\`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}\`
const HALO_FRAG=\`
  uniform vec3 uColor; uniform float uIntensity; varying vec2 vUv;
  void main(){
    vec2 uv=vUv-0.5; float dist=length(uv); if(dist>0.5)discard;
    float core=exp(-dist*10.0)*3.0; float glow=exp(-dist*4.0);
    float angle=atan(uv.y,uv.x); float rays=0.0;
    for(int i=0;i<12;i++){float a=float(i)*3.14159/6.0;float s=pow(max(0.0,cos(angle-a)),16.0)*exp(-dist*5.5);rays+=s;}
    float total=(core+glow+rays*0.45)*uIntensity;
    gl_FragColor=vec4(uColor*total,clamp(total*0.85,0.0,1.0));
  }
\`
function VolumetricHalo({ color, intensity, size }) {
  const ref = useRef()
  const uniforms = useMemo(()=>({uColor:{value:new Color(color)},uIntensity:{value:intensity}}),[])
  useFrame(({camera})=>{
    if(!ref.current) return
    ref.current.quaternion.copy(camera.quaternion)
    ref.current.material.uniforms.uColor.value.set(color)
    ref.current.material.uniforms.uIntensity.value=intensity
  })
  return (
    <mesh ref={ref} renderOrder={999}>
      <planeGeometry args={[size,size]} />
      <shaderMaterial vertexShader={HALO_VERT} fragmentShader={HALO_FRAG} uniforms={uniforms}
        transparent depthWrite={false} depthTest={false} blending={AdditiveBlending} toneMapped={false} />
    </mesh>
  )
}` : ''

  const glbHelper = hasGlb ? `
function GlbGlassModel({ url, position, rotation, scale, mat }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  useEffect(() => {
    cloned.traverse(child => {
      if (!child.isMesh) return
      child.material = new THREE.MeshPhysicalMaterial({
        transmission: mat.transmission, ior: mat.ior, thickness: mat.thickness,
        roughness: mat.roughness, iridescence: mat.iridescence, iridescenceIOR: 1.3,
        envMapIntensity: mat.envMapIntensity, color: mat.color,
        transparent: true, side: THREE.DoubleSide,
      })
    })
  }, [cloned, mat])
  return <group position={position} rotation={rotation} scale={scale}><primitive object={cloned} /></group>
}` : ''

  const meshes = visibleObjs.map((o, i) => objectCode(o, i)).join('\n\n')
  const gradientHooks = visibleObjs
    .filter(o => o.mat.gradientEnabled)
    .map(o => `  const gradMap_${o.id.replace(/\W/g, '_')} = useGradientTexture(${JSON.stringify(o.mat.gradientStops)}, ${o.mat.gradientAngle})`)
    .join('\n')

  const hdriLine = scene.hdri !== 'None'
    ? `      <Environment preset="${scene.hdri}" />`
    : ''

  const camPos = `[${camera.position.map(fmt).join(', ')}]`

  return `${imports}

// ─── Glass Scene ─────────────────────────────────────────────────────────────
${backdropCode}
${glbHelper}
${gradientHelper}
${haloHelper}
function GlassScene() {
${gradientHooks ? gradientHooks + '\n' : ''}  return (
    <>
      <Backdrop />
${hdriLine}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 3, 2]} intensity={0.8} color="#7b61ff" />
      <pointLight position={[4, -2, 3]} intensity={0.6} color="#ff61b6" />

${meshes}
${postFXCode}
    </>
  )
}

// ─── Usage ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Canvas
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: ${camPos}, fov: ${fmt(camera.fov)}, near: ${fmt(camera.near)}, far: ${fmt(camera.far)} }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <GlassScene />
      </Suspense>
    </Canvas>
  )
}
`
}
