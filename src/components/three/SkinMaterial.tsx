interface Props {
  color?: string
  subsurfaceColor?: string
  subsurfaceIntensity?: number
}

export function SkinMaterial({ color='#ffaa88', subsurfaceColor='#ff6644', subsurfaceIntensity=0.5 }: Props) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.6}
      metalness={0}
      sheen={0.4}
      sheenColor={subsurfaceColor}
      sheenRoughness={0.8}
      thickness={subsurfaceIntensity * 2}
      transmission={0.05}
      ior={1.4}
      clearcoat={0.2}
      clearcoatRoughness={0.4}
    />
  )
}
