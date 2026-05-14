/** Glass material presets — color tint + optional roughness/iridescence overrides */

export type ResolvedGlass = {
  color: string
  roughness: number
  iridescence: number
}

type Preset = {
  color: string
  roughness?: number
  iridescence?: number
}

const PRESETS: Record<string, Preset> = {
  Custom:   { color: '#ffffff' },
  Frosted:  { color: '#ddeeff', roughness: 0.42, iridescence: 0.04 },
  Rose:     { color: '#ffb3c6', iridescence: 0.35 },
  Sapphire: { color: '#4488ff', iridescence: 0.18 },
  Emerald:  { color: '#44cc88', iridescence: 0.22 },
  Amber:    { color: '#ffaa22', iridescence: 0.08 },
  Smoke:    { color: '#778899', roughness: 0.15, iridescence: 0.04 },
  Gold:     { color: '#ffcc44', roughness: 0.03, iridescence: 0.5 },
  Ice:      { color: '#cceeff', roughness: 0.08, iridescence: 0.6 },
}

export function resolveGlassAppearance(
  preset: string,
  customColor: string,
  baseRoughness: number,
  baseIridescence: number,
): ResolvedGlass {
  const p = PRESETS[preset] ?? PRESETS.Custom
  return {
    color:      preset === 'Custom' ? customColor : p.color,
    roughness:  p.roughness   ?? baseRoughness,
    iridescence: p.iridescence ?? baseIridescence,
  }
}
