import { MeshStandardMaterial } from 'three'
import { useMemo } from 'react'

const METAL_PRESETS = {
  'brushed-aluminium': { color: '#aaaaaa', roughness: 0.35, metalness: 1 },
  'polished-steel':    { color: '#cccccc', roughness: 0.05, metalness: 1 },
  'gold':              { color: '#ffd700', roughness: 0.1,  metalness: 1 },
  'brass':             { color: '#c8a020', roughness: 0.2,  metalness: 1 },
}

interface Props {
  preset?: keyof typeof METAL_PRESETS
  color?: string
  roughness?: number
}

export function MetalMaterial({ preset = 'brushed-aluminium', color, roughness }: Props) {
  const base = METAL_PRESETS[preset]
  return (
    <meshStandardMaterial
      color={color ?? base.color}
      roughness={roughness ?? base.roughness}
      metalness={base.metalness}
      envMapIntensity={1.5}
    />
  )
}
