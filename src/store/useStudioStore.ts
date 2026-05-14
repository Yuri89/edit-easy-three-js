import { create } from 'zustand'

export type ObjectType = 'sphere' | 'cube' | 'torus' | 'cylinder' | 'plane' | 'glb' | 'text'
export type TransformMode = 'translate' | 'rotate' | 'scale'

// ─── Scene / Background settings ─────────────────────────────────────────────
export type BgMode = 'Blobs' | 'Solid' | 'Gradient'
export type HdriPreset = 'None' | 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'

export interface SceneSettings {
  bgMode: BgMode
  bgColor1: string
  bgColor2: string
  bloomEnabled: boolean
  bloomIntensity: number
  bloomThreshold: number
  chromaticAberration: number
  hdri: HdriPreset
}

const DEFAULT_SCENE: SceneSettings = {
  bgMode: 'Blobs',
  bgColor1: '#e8005a',
  bgColor2: '#0055ff',
  bloomEnabled: true,
  bloomIntensity: 0.4,
  bloomThreshold: 0.7,
  chromaticAberration: 0.06,
  hdri: 'city',
}

// ─── Camera Post-FX state ─────────────────────────────────────────────────────
export interface CameraEffects {
  // Optical
  dof: boolean; dofFocusDistance: number; dofFocalLength: number; dofBokehScale: number
  vignette: boolean; vignetteOffset: number; vignetteDarkness: number
  filmGrain: boolean; filmGrainIntensity: number
  lensDistortion: boolean; lensDistortionStrength: number   // positive=barrel, negative=pincushion
  // Lens
  lensFlare: boolean; lensFlareIntensity: number
  anamorphicFlare: boolean; anamorphicFlareIntensity: number
  dreamGlow: boolean; dreamGlowIntensity: number; dreamGlowColor: string
  // Atmosphere
  heatDistortion: boolean; heatDistortionStrength: number; heatDistortionSpeed: number
  underwater: boolean; underwaterStrength: number
  // Camera Modes
  nightVision: boolean; nightVisionIntensity: number
  thermal: boolean
  vhsCrt: boolean; vhsIntensity: number
  cctv: boolean
  droneHud: boolean; droneHudColor: string
  glitch: boolean; glitchStrength: number
  // Motion
  cameraShake: boolean; cameraShakeIntensity: number
}

const DEFAULT_CAMERA_EFFECTS: CameraEffects = {
  dof: false, dofFocusDistance: 0.02, dofFocalLength: 0.05, dofBokehScale: 3,
  vignette: false, vignetteOffset: 0.5, vignetteDarkness: 0.5,
  filmGrain: false, filmGrainIntensity: 0.35,
  lensDistortion: false, lensDistortionStrength: 0.3,
  lensFlare: false, lensFlareIntensity: 1.0,
  anamorphicFlare: false, anamorphicFlareIntensity: 1.0,
  dreamGlow: false, dreamGlowIntensity: 1.5, dreamGlowColor: '#ffccff',
  heatDistortion: false, heatDistortionStrength: 0.5, heatDistortionSpeed: 1.0,
  underwater: false, underwaterStrength: 0.5,
  nightVision: false, nightVisionIntensity: 2.0,
  thermal: false,
  vhsCrt: false, vhsIntensity: 0.8,
  cctv: false,
  droneHud: false, droneHudColor: '#00ff88',
  glitch: false, glitchStrength: 0.3,
  cameraShake: false, cameraShakeIntensity: 0.3,
}

export type MaterialType =
  // transmissive
  | 'glass' | 'water' | 'crystal'
  // realistas
  | 'metal' | 'mercury' | 'marble' | 'ice' | 'pearlescent' | 'holographic'
  // sci-fi
  | 'plasma' | 'forcefield' | 'nebula' | 'portal' | 'electric' | 'matrix'
  // orgânicos
  | 'lava' | 'slime' | 'skin' | 'magmarock' | 'alienflesh' | 'wetmud'
  // ambientais
  | 'fire' | 'sand' | 'rainglass' | 'aurora' | 'fog' | 'cloud'
  // emissivo
  | 'tvscreen' | 'light' | 'halo'

export interface GradientStop {
  color: string
  position: number // 0..1
}

export interface GlassMat {
  materialType: MaterialType
  transmission: number
  ior: number
  thickness: number
  roughness: number
  iridescence: number
  envMapIntensity: number
  preset: string
  color: string
  // lava
  lavaColor1: string
  lavaColor2: string
  lavaSpeed: number
  lavaScale: number
  // tv screen
  tvColor: string
  tvScanlines: number
  tvNoise: number
  tvBrightness: number
  // metal
  metalPreset: 'brushed-aluminium' | 'polished-steel' | 'gold' | 'brass'
  metalColor: string
  metalRoughness: number
  // mercury
  mercuryColor: string
  mercuryRipple: number
  // marble
  marbleColor1: string
  marbleColor2: string
  marbleVeinScale: number
  marbleVeinIntensity: number
  // ice
  iceColor: string
  iceCrackIntensity: number
  iceFrost: number
  // pearlescent
  pearlBaseColor: string
  pearlShiftIntensity: number
  // holographic
  holoColor: string
  holoScanSpeed: number
  holoStripeCount: number
  // plasma
  plasmaColor1: string
  plasmaColor2: string
  plasmaSpeed: number
  plasmaScale: number
  // forcefield
  ffColor: string
  ffHexSize: number
  ffPulseSpeed: number
  // nebula
  nebulaColor1: string
  nebulaColor2: string
  nebulaColor3: string
  nebulaSpeed: number
  // portal
  portalColor1: string
  portalColor2: string
  portalSpeed: number
  portalDistortion: number
  // electric
  electricColor: string
  electricIntensity: number
  electricSpeed: number
  // matrix
  matrixColor: string
  matrixSpeed: number
  matrixDensity: number
  // slime
  slimeColor: string
  slimeRippleSpeed: number
  // skin
  skinColor: string
  skinSubsurfaceColor: string
  skinSubsurfaceIntensity: number
  // magmarock
  magmaRockColor: string
  magmaCrackColor: string
  magmaGlow: number
  magmaSpeed: number
  // alienflesh
  alienColor1: string
  alienColor2: string
  alienPulseSpeed: number
  // wetmud
  mudColor: string
  mudWetness: number
  // fire
  fireColor1: string
  fireColor2: string
  fireSpeed: number
  fireScale: number
  // sand
  sandColor: string
  sandRippleScale: number
  sandWindSpeed: number
  // rainglass
  rainIntensity: number
  rainSpeed: number
  rainDropSize: number
  // aurora
  auroraColor1: string
  auroraColor2: string
  auroraColor3: string
  auroraSpeed: number
  // fog
  fogColor: string
  fogDensity: number
  fogSpeed: number
  // cloud
  cloudColor: string
  cloudSpeed: number
  cloudOpacity: number
  // light / emissive
  lightEnabled: boolean
  emissiveColor: string
  emissiveIntensity: number
  lightColor: string
  lightIntensity: number
  lightDistance: number
  // volumetric halo
  godRays: boolean
  godRaysIntensity: number
  godRaysSize: number
  godRaysColor: string
  // gradient
  gradientEnabled: boolean
  gradientStops: GradientStop[]
  gradientAngle: number
  // scattering
  distortion: number
  distortionScale: number
}

export interface SceneObject {
  id: string
  name: string
  type: ObjectType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  visible: boolean
  glbUrl?: string
  mat: GlassMat
  // text
  textContent?: string
  textSize?: number
  textDepth?: number
}

export interface CameraSettings {
  fov: number
  position: [number, number, number]
  near: number
  far: number
}

interface StudioState {
  objects: SceneObject[]
  selectedId: string | null
  transformMode: TransformMode
  showExport: boolean
  camera: CameraSettings
  cameraEffects: CameraEffects
  scene: SceneSettings
  _history: SceneObject[][]
  _future: SceneObject[][]
  // actions
  addObject: (type: ObjectType, glbUrl?: string) => void
  removeObject: (id: string) => void
  updateObject: (id: string, patch: Partial<Omit<SceneObject, 'id' | 'mat'>>) => void
  updateMaterial: (id: string, patch: Partial<GlassMat>) => void
  selectObject: (id: string | null) => void
  setTransformMode: (mode: TransformMode) => void
  setShowExport: (v: boolean) => void
  toggleVisible: (id: string) => void
  duplicateObject: (id: string) => void
  updateCamera: (patch: Partial<CameraSettings>) => void
  updateCameraEffects: (patch: Partial<CameraEffects>) => void
  updateScene: (patch: Partial<SceneSettings>) => void
  undo: () => void
  redo: () => void
}

const DEFAULT_MAT: GlassMat = {
  materialType: 'glass',
  transmission: 1,
  ior: 1.5,
  thickness: 0.8,
  roughness: 0.05,
  iridescence: 0.2,
  envMapIntensity: 1.5,
  preset: 'Custom',
  color: '#ffffff',
  lavaColor1: '#ff4400',
  lavaColor2: '#220000',
  lavaSpeed: 1,
  lavaScale: 3,
  tvColor: '#00ff88',
  tvScanlines: 120,
  tvNoise: 0.05,
  tvBrightness: 1.2,
  metalPreset: 'brushed-aluminium',
  metalColor: '#aaaaaa',
  metalRoughness: 0.4,
  mercuryColor: '#999999',
  mercuryRipple: 0.3,
  marbleColor1: '#e8e8e8',
  marbleColor2: '#555555',
  marbleVeinScale: 4,
  marbleVeinIntensity: 0.8,
  iceColor: '#a8d8ea',
  iceCrackIntensity: 0.6,
  iceFrost: 0.3,
  pearlBaseColor: '#f0e8ff',
  pearlShiftIntensity: 0.8,
  holoColor: '#00ffff',
  holoScanSpeed: 1,
  holoStripeCount: 20,
  plasmaColor1: '#ff00ff',
  plasmaColor2: '#00ffff',
  plasmaSpeed: 1,
  plasmaScale: 3,
  ffColor: '#00ffaa',
  ffHexSize: 8,
  ffPulseSpeed: 1,
  nebulaColor1: '#ff4488',
  nebulaColor2: '#4400ff',
  nebulaColor3: '#00ffcc',
  nebulaSpeed: 0.2,
  portalColor1: '#7700ff',
  portalColor2: '#00ccff',
  portalSpeed: 1,
  portalDistortion: 0.5,
  electricColor: '#88aaff',
  electricIntensity: 1,
  electricSpeed: 2,
  matrixColor: '#00ff41',
  matrixSpeed: 1.5,
  matrixDensity: 0.5,
  slimeColor: '#44ff44',
  slimeRippleSpeed: 0.8,
  skinColor: '#ffaa88',
  skinSubsurfaceColor: '#ff6644',
  skinSubsurfaceIntensity: 0.5,
  magmaRockColor: '#222222',
  magmaCrackColor: '#ff6600',
  magmaGlow: 1.5,
  magmaSpeed: 0.5,
  alienColor1: '#22ff88',
  alienColor2: '#004422',
  alienPulseSpeed: 1,
  mudColor: '#5c4033',
  mudWetness: 0.6,
  fireColor1: '#ffdd00',
  fireColor2: '#ff2200',
  fireSpeed: 1.2,
  fireScale: 3,
  sandColor: '#c2b280',
  sandRippleScale: 5,
  sandWindSpeed: 0.4,
  rainIntensity: 0.7,
  rainSpeed: 0.8,
  rainDropSize: 1,
  auroraColor1: '#00ff88',
  auroraColor2: '#8800ff',
  auroraColor3: '#0044ff',
  auroraSpeed: 0.3,
  fogColor: '#aabbcc',
  fogDensity: 0.5,
  fogSpeed: 0.3,
  cloudColor: '#ffffff',
  cloudSpeed: 0.2,
  cloudOpacity: 0.85,
  lightEnabled: false,
  emissiveColor: '#ffffff',
  emissiveIntensity: 2,
  lightColor: '#ffffff',
  lightIntensity: 3,
  lightDistance: 4,
  godRays: true,
  godRaysIntensity: 1.2,
  godRaysSize: 4,
  godRaysColor: '#ffffff',
  gradientEnabled: false,
  gradientStops: [
    { color: '#ff6ec7', position: 0 },
    { color: '#3b82f6', position: 1 },
  ],
  gradientAngle: 0,
  distortion: 0,
  distortionScale: 0.5,
}

let counter = 0
function uid() { return `obj_${++counter}` }

const TYPE_NAMES: Record<ObjectType, string> = {
  sphere: 'Sphere',
  cube: 'Cube',
  torus: 'Torus',
  cylinder: 'Cylinder',
  plane: 'Plane',
  glb: 'GLB Model',
  text: 'Text',
}

const HISTORY_LIMIT = 50

export const useStudioStore = create<StudioState>((set, get) => ({
  objects: [],
  selectedId: null,
  transformMode: 'translate',
  showExport: false,
  camera: { fov: 50, position: [0, 0, 6], near: 0.1, far: 100 },
  cameraEffects: { ...DEFAULT_CAMERA_EFFECTS },
  scene: { ...DEFAULT_SCENE },
  _history: [],
  _future: [],

  undo: () => {
    const { _history, objects, _future } = get()
    if (_history.length === 0) return
    const prev = _history[_history.length - 1]
    set({
      objects: prev,
      _history: _history.slice(0, -1),
      _future: [objects, ..._future].slice(0, HISTORY_LIMIT),
    })
  },

  redo: () => {
    const { _future, objects, _history } = get()
    if (_future.length === 0) return
    const next = _future[0]
    set({
      objects: next,
      _future: _future.slice(1),
      _history: [..._history, objects].slice(-HISTORY_LIMIT),
    })
  },

  addObject: (type, glbUrl) => {
    const existing = get().objects.filter(o => o.type === type).length
    const id = uid()
    const name = `${TYPE_NAMES[type]} ${existing + 1}`
    const obj: SceneObject = {
      id,
      name,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      glbUrl,
      mat: { ...DEFAULT_MAT },
      ...(type === 'text' ? { textContent: 'Text', textSize: 0.6, textDepth: 0.2 } : {}),
    }
    const snap = get().objects
    set(s => ({
      objects: [...s.objects, obj],
      selectedId: id,
      _history: [...s._history, snap].slice(-HISTORY_LIMIT),
      _future: [],
    }))
  },

  removeObject: (id) => {
    const snap = get().objects
    set(s => ({
      objects: s.objects.filter(o => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      _history: [...s._history, snap].slice(-HISTORY_LIMIT),
      _future: [],
    }))
  },

  updateObject: (id, patch) => {
    const snap = get().objects
    set(s => ({
      objects: s.objects.map(o => o.id === id ? { ...o, ...patch } : o),
      _history: [...s._history, snap].slice(-HISTORY_LIMIT),
      _future: [],
    }))
  },

  updateMaterial: (id, patch) => {
    const snap = get().objects
    set(s => ({
      objects: s.objects.map(o =>
        o.id === id ? { ...o, mat: { ...o.mat, ...patch } } : o,
      ),
      _history: [...s._history, snap].slice(-HISTORY_LIMIT),
      _future: [],
    }))
  },

  selectObject: (id) => set({ selectedId: id }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setShowExport: (v) => set({ showExport: v }),

  toggleVisible: (id) => {
    set(s => ({
      objects: s.objects.map(o =>
        o.id === id ? { ...o, visible: !o.visible } : o,
      ),
    }))
  },

  duplicateObject: (id) => {
    const obj = get().objects.find(o => o.id === id)
    if (!obj) return
    const newId = uid()
    const snap = get().objects
    set(s => ({
      objects: [...s.objects, {
        ...obj,
        id: newId,
        name: obj.name + ' Copy',
        position: [obj.position[0] + 0.5, obj.position[1] + 0.5, obj.position[2]],
      }],
      selectedId: newId,
      _history: [...s._history, snap].slice(-HISTORY_LIMIT),
      _future: [],
    }))
  },

  updateCamera: (patch) => set(s => ({ camera: { ...s.camera, ...patch } })),
  updateCameraEffects: (patch) => set(s => ({ cameraEffects: { ...s.cameraEffects, ...patch } })),
  updateScene: (patch) => set(s => ({ scene: { ...s.scene, ...patch } })),
}))
