import { useState } from 'react'
import { useStudioStore } from '../../store/useStudioStore'
import type { SceneObject, GradientStop, MaterialType, CameraSettings, CameraEffects, SceneSettings, BgMode, HdriPreset } from '../../store/useStudioStore'
const PRESETS = ['Custom', 'Frosted', 'Rose', 'Sapphire', 'Emerald', 'Amber', 'Smoke', 'Gold', 'Ice']
const METAL_PRESETS = ['brushed-aluminium', 'polished-steel', 'gold', 'brass'] as const

const MAT_CATEGORIES: { label: string; items: { id: MaterialType; label: string; icon: string }[] }[] = [
  { label: 'Transmissivo', items: [
    { id: 'glass',       label: 'Glass',      icon: '🪟' },
    { id: 'water',       label: 'Water',      icon: '💧' },
    { id: 'crystal',     label: 'Crystal',    icon: '💎' },
  ]},
  { label: 'Realistas', items: [
    { id: 'metal',       label: 'Metal',      icon: '🔩' },
    { id: 'mercury',     label: 'Mercury',    icon: '🪞' },
    { id: 'marble',      label: 'Marble',     icon: '🪨' },
    { id: 'ice',         label: 'Ice',        icon: '🧊' },
    { id: 'pearlescent', label: 'Pearl',      icon: '🫧' },
    { id: 'holographic', label: 'Holo',       icon: '🌈' },
  ]},
  { label: 'Sci-Fi', items: [
    { id: 'plasma',      label: 'Plasma',     icon: '⚡' },
    { id: 'forcefield',  label: 'Shield',     icon: '🛡️' },
    { id: 'nebula',      label: 'Nebula',     icon: '🌌' },
    { id: 'portal',      label: 'Portal',     icon: '🌀' },
    { id: 'electric',    label: 'Electric',   icon: '🔆' },
    { id: 'matrix',      label: 'Matrix',     icon: '🖥️' },
  ]},
  { label: 'Orgânicos', items: [
    { id: 'lava',        label: 'Lava',       icon: '🌋' },
    { id: 'slime',       label: 'Slime',      icon: '🟢' },
    { id: 'skin',        label: 'Skin',       icon: '🫀' },
    { id: 'magmarock',   label: 'Magma',      icon: '🪨' },
    { id: 'alienflesh',  label: 'Alien',      icon: '👽' },
    { id: 'wetmud',      label: 'Mud',        icon: '🌿' },
  ]},
  { label: 'Ambientais', items: [
    { id: 'fire',        label: 'Fire',       icon: '🔥' },
    { id: 'sand',        label: 'Sand',       icon: '🏜️' },
    { id: 'rainglass',   label: 'Rain',       icon: '🌧️' },
    { id: 'aurora',      label: 'Aurora',     icon: '🌠' },
    { id: 'fog',         label: 'Fog',        icon: '🌫️' },
    { id: 'cloud',       label: 'Cloud',      icon: '☁️' },
  ]},
  { label: 'Emissivo', items: [
    { id: 'tvscreen',    label: 'TV',         icon: '📺' },
    { id: 'light',       label: 'Light',      icon: '💡' },
    { id: 'halo',        label: 'Halo',       icon: '🌟' },
  ]},
]

function Vec3Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: [number, number, number]
  onChange: (v: [number, number, number]) => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="props-slider-label" style={{ marginBottom: 4 }}>{label}</div>
      {(['X', 'Y', 'Z'] as const).map((axis, i) => (
        <div key={axis} className="props-row" style={{ marginBottom: 4 }}>
          <span className="props-label" style={{ width: 12, fontSize: 10, color: axis === 'X' ? '#f87171' : axis === 'Y' ? '#4ade80' : '#60a5fa' }}>{axis}</span>
          <input
            className="props-input"
            type="number"
            step={0.05}
            value={+value[i].toFixed(3)}
            onChange={e => {
              const next = [...value] as [number, number, number]
              next[i] = parseFloat(e.target.value) || 0
              onChange(next)
            }}
          />
        </div>
      ))}
    </div>
  )
}

function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="props-slider-row">
      <span className="props-slider-label">{label}</span>
      <input
        className="props-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <span className="props-slider-val">{value.toFixed(2)}</span>
    </div>
  )
}

function TextSection({ obj }: { obj: SceneObject }) {
  const { updateObject } = useStudioStore()
  return (
    <div className="props-section">
      <div className="props-section-title">Text</div>
      <div style={{ marginBottom: 8 }}>
        <div className="props-slider-label" style={{ marginBottom: 4 }}>Content</div>
        <input
          className="props-input"
          type="text"
          style={{ width: '100%', boxSizing: 'border-box' }}
          value={obj.textContent ?? ''}
          onChange={e => updateObject(obj.id, { textContent: e.target.value })}
        />
      </div>
      <div className="props-slider-row">
        <span className="props-slider-label">Size</span>
        <input className="props-slider" type="range" min={0.1} max={3} step={0.05}
          value={obj.textSize ?? 0.6}
          onChange={e => updateObject(obj.id, { textSize: parseFloat(e.target.value) })} />
        <span className="props-slider-val">{(obj.textSize ?? 0.6).toFixed(2)}</span>
      </div>
      <div className="props-slider-row">
        <span className="props-slider-label">Depth</span>
        <input className="props-slider" type="range" min={0.01} max={1} step={0.01}
          value={obj.textDepth ?? 0.2}
          onChange={e => updateObject(obj.id, { textDepth: parseFloat(e.target.value) })} />
        <span className="props-slider-val">{(obj.textDepth ?? 0.2).toFixed(2)}</span>
      </div>
    </div>
  )
}

function TransformSection({ obj }: { obj: SceneObject }) {
  const { updateObject } = useStudioStore()
  return (
    <div className="props-section">
      <div className="props-section-title">Transform</div>
      <Vec3Input label="Position" value={obj.position} onChange={v => updateObject(obj.id, { position: v })} />
      <Vec3Input
        label="Rotation (rad)"
        value={obj.rotation}
        onChange={v => updateObject(obj.id, { rotation: v })}
      />
      <Vec3Input label="Scale" value={obj.scale} onChange={v => updateObject(obj.id, { scale: v })} />
    </div>
  )
}

function MaterialSection({ obj }: { obj: SceneObject }) {
  const m = useStudioStore(s => {
    const sel = s.objects.find(o => o.id === obj.id)
    return sel ? sel.mat : obj.mat
  })
  const up = (patch: Partial<typeof m>) =>
    useStudioStore.getState().updateMaterial(obj.id, patch)

  const mt = m.materialType

  return (
    <div className="props-section">
      <div className="props-section-title">Material</div>

      {/* Material type selector — categorized */}
      <div style={{ marginBottom: 14 }}>
        {MAT_CATEGORIES.map(cat => (
          <div key={cat.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{cat.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {cat.items.map(({ id, label, icon }) => {
                const active = mt === id
                return (
                  <button key={id} onClick={() => up({ materialType: id })} style={{
                    background: active ? '#ff9f40' : '#1e1e1e',
                    color: active ? '#000' : '#aaa',
                    border: '1px solid ' + (active ? '#ff9f40' : '#333'),
                    borderRadius: 6, padding: '5px 2px', fontSize: 11, cursor: 'pointer',
                    fontWeight: active ? 700 : 400, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2,
                  }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Glass / Water / Crystal controls */}
      {(mt === 'glass' || mt === 'water' || mt === 'crystal') && (
        <>
          {mt === 'glass' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <div className="props-slider-label" style={{ marginBottom: 4 }}>Preset</div>
                <select className="props-select" value={m.preset} onChange={e => up({ preset: e.target.value })}>
                  {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="props-color-row">
                <input className="props-color-input" type="color" value={m.color} onChange={e => up({ color: e.target.value })} />
                <span className="props-color-label">Tint Color</span>
              </div>
            </>
          )}
          {mt === 'water' && (
            <div className="props-color-row">
              <input className="props-color-input" type="color" value={m.color} onChange={e => up({ color: e.target.value })} />
              <span className="props-color-label">Water Tint</span>
            </div>
          )}
          {mt === 'crystal' && (
            <div className="props-color-row">
              <input className="props-color-input" type="color" value={m.color} onChange={e => up({ color: e.target.value })} />
              <span className="props-color-label">Crystal Tint</span>
            </div>
          )}
          <Slider label="Transmission"  value={m.transmission}    onChange={v => up({ transmission: v })} />
          {mt !== 'water' && <Slider label="IOR" value={m.ior} min={1} max={2.33} onChange={v => up({ ior: v })} />}
          <Slider label="Thickness"     value={m.thickness}       min={0} max={3} step={0.05} onChange={v => up({ thickness: v })} />
          <Slider label="Roughness"     value={m.roughness}       onChange={v => up({ roughness: v })} />
          {mt !== 'water' && <Slider label="Iridescence" value={m.iridescence} onChange={v => up({ iridescence: v })} />}
          <Slider label="Env Intensity" value={m.envMapIntensity} min={0} max={5} step={0.1} onChange={v => up({ envMapIntensity: v })} />
          {mt === 'glass' && (
            <>
              <Slider label="Distortion"    value={m.distortion}     min={0} max={1}   step={0.01} onChange={v => up({ distortion: v })} />
              <Slider label="Distort Scale" value={m.distortionScale} min={0} max={2}   step={0.01} onChange={v => up({ distortionScale: v })} />
            </>
          )}
          {mt === 'water' && (
            <>
              <Slider label="Wave Distortion" value={m.distortion}     min={0} max={0.5} step={0.01} onChange={v => up({ distortion: v })} />
              <Slider label="Wave Scale"      value={m.distortionScale} min={0} max={2}   step={0.01} onChange={v => up({ distortionScale: v })} />
            </>
          )}
        </>
      )}

      {/* Metal controls */}
      {mt === 'metal' && (
        <>
          <div style={{ marginBottom: 8 }}>
            <div className="props-slider-label" style={{ marginBottom: 4 }}>Preset</div>
            <select className="props-select" value={m.metalPreset} onChange={e => up({ metalPreset: e.target.value as typeof m.metalPreset })}>
              {METAL_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.metalColor} onChange={e => up({ metalColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Roughness" value={m.metalRoughness} onChange={v => up({ metalRoughness: v })} />
        </>
      )}

      {/* Mercury controls */}
      {mt === 'mercury' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.mercuryColor} onChange={e => up({ mercuryColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Ripple" value={m.mercuryRipple} min={0} max={3} step={0.05} onChange={v => up({ mercuryRipple: v })} />
        </>
      )}

      {/* Marble controls */}
      {mt === 'marble' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.marbleColor1} onChange={e => up({ marbleColor1: e.target.value })} />
            <span className="props-color-label">Base Color</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.marbleColor2} onChange={e => up({ marbleColor2: e.target.value })} />
            <span className="props-color-label">Vein Color</span>
          </div>
          <Slider label="Vein Scale"     value={m.marbleVeinScale}     min={0.5} max={10}  step={0.1}  onChange={v => up({ marbleVeinScale: v })} />
          <Slider label="Vein Intensity" value={m.marbleVeinIntensity} min={0}   max={3}   step={0.05} onChange={v => up({ marbleVeinIntensity: v })} />
        </>
      )}

      {/* Ice controls */}
      {mt === 'ice' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.iceColor} onChange={e => up({ iceColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Cracks"    value={m.iceCrackIntensity} min={0} max={2}  step={0.05} onChange={v => up({ iceCrackIntensity: v })} />
          <Slider label="Frost"     value={m.iceFrost}          min={0} max={1}  step={0.01} onChange={v => up({ iceFrost: v })} />
        </>
      )}

      {/* Pearlescent controls */}
      {mt === 'pearlescent' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.pearlBaseColor} onChange={e => up({ pearlBaseColor: e.target.value })} />
            <span className="props-color-label">Base Color</span>
          </div>
          <Slider label="Shift Intensity" value={m.pearlShiftIntensity} min={0} max={3} step={0.05} onChange={v => up({ pearlShiftIntensity: v })} />
        </>
      )}

      {/* Holographic controls */}
      {mt === 'holographic' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.holoColor} onChange={e => up({ holoColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Scan Speed"    value={m.holoScanSpeed}   min={0} max={5}   step={0.1} onChange={v => up({ holoScanSpeed: v })} />
          <Slider label="Stripe Count"  value={m.holoStripeCount} min={5} max={100} step={1}   onChange={v => up({ holoStripeCount: v })} />
        </>
      )}

      {/* Plasma controls */}
      {mt === 'plasma' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.plasmaColor1} onChange={e => up({ plasmaColor1: e.target.value })} />
            <span className="props-color-label">Color 1</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.plasmaColor2} onChange={e => up({ plasmaColor2: e.target.value })} />
            <span className="props-color-label">Color 2</span>
          </div>
          <Slider label="Speed" value={m.plasmaSpeed} min={0} max={5}  step={0.1} onChange={v => up({ plasmaSpeed: v })} />
          <Slider label="Scale" value={m.plasmaScale} min={1} max={10} step={0.5} onChange={v => up({ plasmaScale: v })} />
        </>
      )}

      {/* Force Field controls */}
      {mt === 'forcefield' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.ffColor} onChange={e => up({ ffColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Hex Size"    value={m.ffHexSize}    min={0.1} max={2}  step={0.05} onChange={v => up({ ffHexSize: v })} />
          <Slider label="Pulse Speed" value={m.ffPulseSpeed} min={0}   max={5}  step={0.1}  onChange={v => up({ ffPulseSpeed: v })} />
        </>
      )}

      {/* Nebula controls */}
      {mt === 'nebula' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.nebulaColor1} onChange={e => up({ nebulaColor1: e.target.value })} />
            <span className="props-color-label">Color 1</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.nebulaColor2} onChange={e => up({ nebulaColor2: e.target.value })} />
            <span className="props-color-label">Color 2</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.nebulaColor3} onChange={e => up({ nebulaColor3: e.target.value })} />
            <span className="props-color-label">Color 3</span>
          </div>
          <Slider label="Speed" value={m.nebulaSpeed} min={0} max={2} step={0.05} onChange={v => up({ nebulaSpeed: v })} />
        </>
      )}

      {/* Portal controls */}
      {mt === 'portal' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.portalColor1} onChange={e => up({ portalColor1: e.target.value })} />
            <span className="props-color-label">Color 1</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.portalColor2} onChange={e => up({ portalColor2: e.target.value })} />
            <span className="props-color-label">Color 2</span>
          </div>
          <Slider label="Speed"      value={m.portalSpeed}      min={0} max={5}  step={0.1}  onChange={v => up({ portalSpeed: v })} />
          <Slider label="Distortion" value={m.portalDistortion} min={0} max={3}  step={0.05} onChange={v => up({ portalDistortion: v })} />
        </>
      )}

      {/* Electric controls */}
      {mt === 'electric' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.electricColor} onChange={e => up({ electricColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Intensity" value={m.electricIntensity} min={0} max={3}  step={0.05} onChange={v => up({ electricIntensity: v })} />
          <Slider label="Speed"     value={m.electricSpeed}     min={0} max={10} step={0.1}  onChange={v => up({ electricSpeed: v })} />
        </>
      )}

      {/* Matrix controls */}
      {mt === 'matrix' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.matrixColor} onChange={e => up({ matrixColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Speed"   value={m.matrixSpeed}   min={0} max={10} step={0.1} onChange={v => up({ matrixSpeed: v })} />
          <Slider label="Density" value={m.matrixDensity} min={5} max={50} step={1}   onChange={v => up({ matrixDensity: v })} />
        </>
      )}

      {/* Lava controls */}
      {mt === 'lava' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.lavaColor1} onChange={e => up({ lavaColor1: e.target.value })} />
            <span className="props-color-label">Hot Color</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.lavaColor2} onChange={e => up({ lavaColor2: e.target.value })} />
            <span className="props-color-label">Dark Color</span>
          </div>
          <Slider label="Speed" value={m.lavaSpeed} min={0} max={5}  step={0.1} onChange={v => up({ lavaSpeed: v })} />
          <Slider label="Scale" value={m.lavaScale} min={1} max={10} step={0.5} onChange={v => up({ lavaScale: v })} />
        </>
      )}

      {/* Slime controls */}
      {mt === 'slime' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.slimeColor} onChange={e => up({ slimeColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Ripple Speed" value={m.slimeRippleSpeed} min={0} max={5} step={0.1} onChange={v => up({ slimeRippleSpeed: v })} />
        </>
      )}

      {/* Skin controls */}
      {mt === 'skin' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.skinColor} onChange={e => up({ skinColor: e.target.value })} />
            <span className="props-color-label">Skin Color</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.skinSubsurfaceColor} onChange={e => up({ skinSubsurfaceColor: e.target.value })} />
            <span className="props-color-label">Subsurface Color</span>
          </div>
          <Slider label="SSS Intensity" value={m.skinSubsurfaceIntensity} min={0} max={3} step={0.05} onChange={v => up({ skinSubsurfaceIntensity: v })} />
        </>
      )}

      {/* Magma Rock controls */}
      {mt === 'magmarock' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.magmaRockColor} onChange={e => up({ magmaRockColor: e.target.value })} />
            <span className="props-color-label">Rock Color</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.magmaCrackColor} onChange={e => up({ magmaCrackColor: e.target.value })} />
            <span className="props-color-label">Crack Color</span>
          </div>
          <Slider label="Glow"  value={m.magmaGlow}  min={0} max={5}  step={0.05} onChange={v => up({ magmaGlow: v })} />
          <Slider label="Speed" value={m.magmaSpeed} min={0} max={5}  step={0.1}  onChange={v => up({ magmaSpeed: v })} />
        </>
      )}

      {/* Alien Flesh controls */}
      {mt === 'alienflesh' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.alienColor1} onChange={e => up({ alienColor1: e.target.value })} />
            <span className="props-color-label">Color 1</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.alienColor2} onChange={e => up({ alienColor2: e.target.value })} />
            <span className="props-color-label">Color 2</span>
          </div>
          <Slider label="Pulse Speed" value={m.alienPulseSpeed} min={0} max={5} step={0.1} onChange={v => up({ alienPulseSpeed: v })} />
        </>
      )}

      {/* Wet Mud controls */}
      {mt === 'wetmud' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.mudColor} onChange={e => up({ mudColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Wetness" value={m.mudWetness} min={0} max={1} step={0.01} onChange={v => up({ mudWetness: v })} />
        </>
      )}

      {/* Fire controls */}
      {mt === 'fire' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.fireColor1} onChange={e => up({ fireColor1: e.target.value })} />
            <span className="props-color-label">Hot Color</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.fireColor2} onChange={e => up({ fireColor2: e.target.value })} />
            <span className="props-color-label">Flame Color</span>
          </div>
          <Slider label="Speed" value={m.fireSpeed} min={0} max={5}  step={0.1} onChange={v => up({ fireSpeed: v })} />
          <Slider label="Scale" value={m.fireScale} min={1} max={10} step={0.5} onChange={v => up({ fireScale: v })} />
        </>
      )}

      {/* Sand controls */}
      {mt === 'sand' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.sandColor} onChange={e => up({ sandColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Ripple Scale" value={m.sandRippleScale} min={1}   max={20}  step={0.5}  onChange={v => up({ sandRippleScale: v })} />
          <Slider label="Wind Speed"   value={m.sandWindSpeed}   min={0}   max={2}   step={0.05} onChange={v => up({ sandWindSpeed: v })} />
        </>
      )}

      {/* Rain Glass controls */}
      {mt === 'rainglass' && (
        <>
          <Slider label="Intensity" value={m.rainIntensity} min={0} max={2}   step={0.05} onChange={v => up({ rainIntensity: v })} />
          <Slider label="Speed"     value={m.rainSpeed}     min={0} max={5}   step={0.1}  onChange={v => up({ rainSpeed: v })} />
          <Slider label="Drop Size" value={m.rainDropSize}  min={0.2} max={4} step={0.1}  onChange={v => up({ rainDropSize: v })} />
        </>
      )}

      {/* Aurora controls */}
      {mt === 'aurora' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.auroraColor1} onChange={e => up({ auroraColor1: e.target.value })} />
            <span className="props-color-label">Color 1</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.auroraColor2} onChange={e => up({ auroraColor2: e.target.value })} />
            <span className="props-color-label">Color 2</span>
          </div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.auroraColor3} onChange={e => up({ auroraColor3: e.target.value })} />
            <span className="props-color-label">Color 3</span>
          </div>
          <Slider label="Speed" value={m.auroraSpeed} min={0} max={2} step={0.05} onChange={v => up({ auroraSpeed: v })} />
        </>
      )}

      {/* Fog controls */}
      {mt === 'fog' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.fogColor} onChange={e => up({ fogColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Density" value={m.fogDensity} min={0} max={1} step={0.01} onChange={v => up({ fogDensity: v })} />
          <Slider label="Speed"   value={m.fogSpeed}   min={0} max={2} step={0.05} onChange={v => up({ fogSpeed: v })} />
        </>
      )}

      {/* Cloud controls */}
      {mt === 'cloud' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.cloudColor} onChange={e => up({ cloudColor: e.target.value })} />
            <span className="props-color-label">Color</span>
          </div>
          <Slider label="Speed"   value={m.cloudSpeed}   min={0} max={2}  step={0.05} onChange={v => up({ cloudSpeed: v })} />
          <Slider label="Opacity" value={m.cloudOpacity} min={0} max={1}  step={0.01} onChange={v => up({ cloudOpacity: v })} />
        </>
      )}

      {/* TV Screen controls */}
      {mt === 'tvscreen' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.tvColor} onChange={e => up({ tvColor: e.target.value })} />
            <span className="props-color-label">Screen Tint</span>
          </div>
          <Slider label="Scanlines"  value={m.tvScanlines}  min={20} max={300} step={1}    onChange={v => up({ tvScanlines: v })} />
          <Slider label="Noise"      value={m.tvNoise}      min={0}  max={0.5} step={0.01} onChange={v => up({ tvNoise: v })} />
          <Slider label="Brightness" value={m.tvBrightness} min={0}  max={3}   step={0.05} onChange={v => up({ tvBrightness: v })} />
        </>
      )}

      {/* Light Emission controls */}
      {mt === 'light' && (
        <>
          {m.gradientStops.map((stop, i) => {
            const updateStop = (patch: Partial<typeof stop>) => {
              const next = m.gradientStops.map((s, j) => j === i ? { ...s, ...patch } : s)
              up({ gradientStops: next })
            }
            const removeStop = () => {
              if (m.gradientStops.length <= 2) return
              up({ gradientStops: m.gradientStops.filter((_, j) => j !== i) })
            }
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <input className="props-color-input" type="color" value={stop.color}
                  onChange={e => updateStop({ color: e.target.value })} style={{ flexShrink: 0 }} />
                <input className="props-slider" type="range" min={0} max={1} step={0.01}
                  value={stop.position} onChange={e => updateStop({ position: parseFloat(e.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: '#888', width: 28, textAlign: 'right', flexShrink: 0 }}>
                  {Math.round(stop.position * 100)}%
                </span>
                <button onClick={removeStop} disabled={m.gradientStops.length <= 2} style={{
                  background: 'none', border: 'none',
                  color: m.gradientStops.length <= 2 ? '#444' : '#f43f5e',
                  cursor: m.gradientStops.length <= 2 ? 'default' : 'pointer', fontSize: 14, lineHeight: 1, padding: 0,
                }}>×</button>
              </div>
            )
          })}
          <button onClick={() => {
            const sorted = [...m.gradientStops].sort((a, b) => a.position - b.position)
            const last = sorted[sorted.length - 1]
            up({ gradientStops: [...m.gradientStops, { color: '#ffffff', position: Math.min(1, last.position + 0.15) }] })
          }} style={{
            width: '100%', background: '#2a2a2a', border: '1px dashed #444',
            color: '#aaa', borderRadius: 4, padding: '3px 0', fontSize: 11, cursor: 'pointer', marginBottom: 8,
          }}>+ Add Stop</button>
          <Slider label="Angle"     value={m.gradientAngle}     min={0}  max={360} step={1}   onChange={v => up({ gradientAngle: v })} />
          <Slider label="Intensity" value={m.emissiveIntensity} min={0}  max={20}  step={0.1} onChange={v => up({ emissiveIntensity: v })} />

          <div className="props-slider-label" style={{ marginBottom: 6, marginTop: 10, color: '#aaa', fontSize: 11 }}>Point Light</div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.lightColor} onChange={e => up({ lightColor: e.target.value })} />
            <span className="props-color-label">Light Color</span>
          </div>
          <Slider label="Light Intensity" value={m.lightIntensity} min={0} max={20} step={0.1} onChange={v => up({ lightIntensity: v })} />
          <Slider label="Light Distance"  value={m.lightDistance}  min={0} max={20} step={0.1} onChange={v => up({ lightDistance: v })} />
        </>
      )}

      {/* Halo controls */}
      {mt === 'halo' && (
        <>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.godRaysColor} onChange={e => up({ godRaysColor: e.target.value })} />
            <span className="props-color-label">Halo Color</span>
          </div>
          <Slider label="Halo Intensity" value={m.godRaysIntensity} min={0} max={5}    step={0.05} onChange={v => up({ godRaysIntensity: v })} />
          <Slider label="Halo Size"      value={m.godRaysSize}      min={0.5} max={12} step={0.1}  onChange={v => up({ godRaysSize: v })} />
          <div className="props-slider-label" style={{ marginBottom: 6, marginTop: 10, color: '#aaa', fontSize: 11 }}>Point Light</div>
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={m.lightColor} onChange={e => up({ lightColor: e.target.value })} />
            <span className="props-color-label">Light Color</span>
          </div>
          <Slider label="Light Intensity" value={m.lightIntensity} min={0} max={20} step={0.1} onChange={v => up({ lightIntensity: v })} />
          <Slider label="Light Distance"  value={m.lightDistance}  min={0} max={20} step={0.1} onChange={v => up({ lightDistance: v })} />
        </>
      )}
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function FxToggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="props-row" style={{ marginBottom: 4 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none', fontSize: 12, color: enabled ? '#d0d0d0' : '#666' }}>
        <input type="checkbox" checked={enabled} onChange={onToggle} style={{ accentColor: '#7c5cbf' }} />
        {label}
      </label>
    </div>
  )
}

function PostFXSection() {
  const fx = useStudioStore(s => s.cameraEffects)
  const up = (patch: Partial<CameraEffects>) => useStudioStore.getState().updateCameraEffects(patch)

  return (
    <div className="props-section">
      <div className="props-section-title">Post-FX</div>

      {/* ── Optical ── */}
      <div className="props-label" style={{ color: '#7c5cbf', marginBottom: 4 }}>Ópticos</div>
      <FxToggle label="Depth of Field" enabled={fx.dof} onToggle={() => up({ dof: !fx.dof })} />
      {fx.dof && (
        <>
          <Slider label="Focus Distance" value={fx.dofFocusDistance} min={0} max={1} step={0.005} onChange={v => up({ dofFocusDistance: v })} />
          <Slider label="Focal Length"   value={fx.dofFocalLength}   min={0} max={0.5} step={0.005} onChange={v => up({ dofFocalLength: v })} />
          <Slider label="Bokeh Scale"    value={fx.dofBokehScale}    min={0} max={10} step={0.1} onChange={v => up({ dofBokehScale: v })} />
        </>
      )}
      <FxToggle label="Vignette" enabled={fx.vignette} onToggle={() => up({ vignette: !fx.vignette })} />
      {fx.vignette && (
        <>
          <Slider label="Offset"   value={fx.vignetteOffset}   min={0} max={1} step={0.01} onChange={v => up({ vignetteOffset: v })} />
          <Slider label="Darkness" value={fx.vignetteDarkness} min={0} max={1} step={0.01} onChange={v => up({ vignetteDarkness: v })} />
        </>
      )}
      <FxToggle label="Film Grain" enabled={fx.filmGrain} onToggle={() => up({ filmGrain: !fx.filmGrain })} />
      {fx.filmGrain && (
        <Slider label="Intensity" value={fx.filmGrainIntensity} min={0} max={1} step={0.01} onChange={v => up({ filmGrainIntensity: v })} />
      )}
      <FxToggle label="Lens Distortion" enabled={fx.lensDistortion} onToggle={() => up({ lensDistortion: !fx.lensDistortion })} />
      {fx.lensDistortion && (
        <Slider label="Strength (+ barrel / − pincushion)" value={fx.lensDistortionStrength} min={-1} max={1} step={0.01} onChange={v => up({ lensDistortionStrength: v })} />
      )}

      {/* ── Lens ── */}
      <div className="props-label" style={{ color: '#7c5cbf', marginBottom: 4, marginTop: 8 }}>Lente</div>
      <FxToggle label="Lens Flare" enabled={fx.lensFlare} onToggle={() => up({ lensFlare: !fx.lensFlare })} />
      {fx.lensFlare && (
        <Slider label="Intensity" value={fx.lensFlareIntensity} min={0} max={3} step={0.05} onChange={v => up({ lensFlareIntensity: v })} />
      )}
      <FxToggle label="Anamorphic Flare" enabled={fx.anamorphicFlare} onToggle={() => up({ anamorphicFlare: !fx.anamorphicFlare })} />
      {fx.anamorphicFlare && (
        <Slider label="Intensity" value={fx.anamorphicFlareIntensity} min={0} max={3} step={0.05} onChange={v => up({ anamorphicFlareIntensity: v })} />
      )}
      <FxToggle label="Dream Glow" enabled={fx.dreamGlow} onToggle={() => up({ dreamGlow: !fx.dreamGlow })} />
      {fx.dreamGlow && (
        <>
          <Slider label="Intensity" value={fx.dreamGlowIntensity} min={0} max={4} step={0.05} onChange={v => up({ dreamGlowIntensity: v })} />
          <div className="props-color-row">
            <input className="props-color-input" type="color" value={fx.dreamGlowColor} onChange={e => up({ dreamGlowColor: e.target.value })} />
            <span className="props-color-label">Glow Color</span>
          </div>
        </>
      )}

      {/* ── Atmosphere ── */}
      <div className="props-label" style={{ color: '#7c5cbf', marginBottom: 4, marginTop: 8 }}>Atmosfera</div>
      <FxToggle label="Heat Distortion" enabled={fx.heatDistortion} onToggle={() => up({ heatDistortion: !fx.heatDistortion })} />
      {fx.heatDistortion && (
        <>
          <Slider label="Strength" value={fx.heatDistortionStrength} min={0} max={2} step={0.05} onChange={v => up({ heatDistortionStrength: v })} />
          <Slider label="Speed"    value={fx.heatDistortionSpeed}    min={0} max={4} step={0.05} onChange={v => up({ heatDistortionSpeed: v })} />
        </>
      )}
      <FxToggle label="Underwater" enabled={fx.underwater} onToggle={() => up({ underwater: !fx.underwater })} />
      {fx.underwater && (
        <Slider label="Strength" value={fx.underwaterStrength} min={0} max={2} step={0.05} onChange={v => up({ underwaterStrength: v })} />
      )}

      {/* ── Camera Modes ── */}
      <div className="props-label" style={{ color: '#7c5cbf', marginBottom: 4, marginTop: 8 }}>Modos de Câmera</div>
      <FxToggle label="Night Vision"    enabled={fx.nightVision}    onToggle={() => up({ nightVision: !fx.nightVision })} />
      {fx.nightVision && (
        <Slider label="Intensity" value={fx.nightVisionIntensity} min={0.5} max={5} step={0.05} onChange={v => up({ nightVisionIntensity: v })} />
      )}
      <FxToggle label="Thermal Camera"  enabled={fx.thermal}        onToggle={() => up({ thermal: !fx.thermal })} />
      <FxToggle label="VHS / CRT"       enabled={fx.vhsCrt}         onToggle={() => up({ vhsCrt: !fx.vhsCrt })} />
      {fx.vhsCrt && (
        <Slider label="Intensity" value={fx.vhsIntensity} min={0} max={2} step={0.05} onChange={v => up({ vhsIntensity: v })} />
      )}
      <FxToggle label="Security Cam (CCTV)" enabled={fx.cctv}    onToggle={() => up({ cctv: !fx.cctv })} />
      <FxToggle label="Drone HUD"           enabled={fx.droneHud} onToggle={() => up({ droneHud: !fx.droneHud })} />
      {fx.droneHud && (
        <div className="props-color-row">
          <input className="props-color-input" type="color" value={fx.droneHudColor} onChange={e => up({ droneHudColor: e.target.value })} />
          <span className="props-color-label">HUD Color</span>
        </div>
      )}
      <FxToggle label="Glitch" enabled={fx.glitch} onToggle={() => up({ glitch: !fx.glitch })} />
      {fx.glitch && (
        <Slider label="Strength" value={fx.glitchStrength} min={0} max={1} step={0.02} onChange={v => up({ glitchStrength: v })} />
      )}

      {/* ── Motion ── */}
      <div className="props-label" style={{ color: '#7c5cbf', marginBottom: 4, marginTop: 8 }}>Movimento</div>
      <FxToggle label="Camera Shake" enabled={fx.cameraShake} onToggle={() => up({ cameraShake: !fx.cameraShake })} />
      {fx.cameraShake && (
        <Slider label="Intensity" value={fx.cameraShakeIntensity} min={0} max={2} step={0.05} onChange={v => up({ cameraShakeIntensity: v })} />
      )}
    </div>
  )
}

function CameraSection() {
  const cam = useStudioStore(s => s.camera)
  const upCam = (patch: Partial<CameraSettings>) => useStudioStore.getState().updateCamera(patch)

  return (
    <div className="props-section">
      <div className="props-section-title">Camera</div>
      <Slider label="FOV" value={cam.fov} min={10} max={120} step={1} onChange={v => upCam({ fov: v })} />
      <Slider label="Near" value={cam.near} min={0.01} max={5} step={0.01} onChange={v => upCam({ near: v })} />
      <Slider label="Far"  value={cam.far}  min={10}   max={500} step={1} onChange={v => upCam({ far: v })} />
      <div style={{ marginBottom: 4 }}>
        <div className="props-slider-label" style={{ marginBottom: 4 }}>Position</div>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} className="props-row" style={{ marginBottom: 4 }}>
            <span className="props-label" style={{ width: 14 }}>{axis}</span>
            <input type="range" className="props-slider" min={-20} max={20} step={0.1}
              value={cam.position[i]}
              onChange={e => {
                const pos = [...cam.position] as [number, number, number]
                pos[i] = parseFloat(e.target.value)
                upCam({ position: pos })
              }} />
            <span className="props-value" style={{ minWidth: 32, textAlign: 'right', fontSize: 10, color: '#888' }}>
              {cam.position[i].toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Background / Bloom / Environment (Scene tab) ────────────────────────────
const HDRI_OPTIONS: HdriPreset[] = ['None','apartment','city','dawn','forest','lobby','night','park','studio','sunset','warehouse']

function BackgroundSection() {
  const sc = useStudioStore(s => s.scene)
  const up = (patch: Partial<SceneSettings>) => useStudioStore.getState().updateScene(patch)

  return (
    <div className="props-section">
      <div className="props-section-title">Background</div>
      <div style={{ marginBottom: 8 }}>
        <div className="props-slider-label" style={{ marginBottom: 4 }}>Mode</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['Blobs','Solid','Gradient'] as BgMode[]).map(m => (
            <button key={m} onClick={() => up({ bgMode: m })} style={{
              flex: 1, padding: '4px 0', fontSize: 11, borderRadius: 5, cursor: 'pointer',
              background: sc.bgMode === m ? 'var(--accent)' : 'var(--surface2)',
              color: sc.bgMode === m ? '#fff' : 'var(--text-dim)',
              border: '1px solid ' + (sc.bgMode === m ? 'var(--accent-h)' : 'var(--border)'),
              fontWeight: sc.bgMode === m ? 700 : 400,
            }}>{m}</button>
          ))}
        </div>
      </div>
      <div className="props-color-row">
        <input className="props-color-input" type="color" value={sc.bgColor1} onChange={e => up({ bgColor1: e.target.value })} />
        <span className="props-color-label">{sc.bgMode === 'Gradient' ? 'Top Color' : 'Color 1'}</span>
      </div>
      {sc.bgMode !== 'Solid' && (
        <div className="props-color-row">
          <input className="props-color-input" type="color" value={sc.bgColor2} onChange={e => up({ bgColor2: e.target.value })} />
          <span className="props-color-label">{sc.bgMode === 'Gradient' ? 'Bottom Color' : 'Color 2'}</span>
        </div>
      )}
    </div>
  )
}

function BloomSection() {
  const sc = useStudioStore(s => s.scene)
  const up = (patch: Partial<SceneSettings>) => useStudioStore.getState().updateScene(patch)

  return (
    <div className="props-section">
      <div className="props-section-title">Bloom &amp; Optics</div>
      <FxToggle label="Bloom" enabled={sc.bloomEnabled} onToggle={() => up({ bloomEnabled: !sc.bloomEnabled })} />
      {sc.bloomEnabled && (
        <>
          <Slider label="Intensity"  value={sc.bloomIntensity}  min={0} max={3}   step={0.05} onChange={v => up({ bloomIntensity: v })} />
          <Slider label="Threshold"  value={sc.bloomThreshold}  min={0} max={1}   step={0.01} onChange={v => up({ bloomThreshold: v })} />
        </>
      )}
      <Slider label="Chrom. Ab."   value={sc.chromaticAberration} min={0} max={0.3} step={0.005} onChange={v => up({ chromaticAberration: v })} />
      <div style={{ marginBottom: 8, marginTop: 4 }}>
        <div className="props-slider-label" style={{ marginBottom: 4 }}>HDRI Environment</div>
        <select className="props-select" value={sc.hdri} onChange={e => up({ hdri: e.target.value as HdriPreset })}>
          {HDRI_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
type PanelTab = 'object' | 'scene'

export function PropertiesPanel() {
  const { objects, selectedId } = useStudioStore()
  const selected = objects.find(o => o.id === selectedId)
  const [tab, setTab] = useState<PanelTab>('object')

  return (
    <div className="studio-properties">
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {(['object', 'scene'] as PanelTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: tab === t ? 700 : 400,
            background: tab === t ? 'var(--surface2)' : 'transparent',
            color: tab === t ? 'var(--text)' : 'var(--text-dim)',
            border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{t === 'object' ? 'Object' : 'Scene'}</button>
        ))}
      </div>

      {tab === 'object' && (
        selected
          ? (
            <>
              {selected.type === 'text' && <TextSection obj={selected} />}
              <TransformSection obj={selected} />
              <MaterialSection obj={selected} />
            </>
          )
          : <div className="props-empty">Select an object<br />to edit its properties</div>
      )}

      {tab === 'scene' && (
        <>
          <BackgroundSection />
          <BloomSection />
          <CameraSection />
          <PostFXSection />
        </>
      )}
    </div>
  )
}
