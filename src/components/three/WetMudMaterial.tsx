interface Props {
  color?: string
  wetness?: number
}

export function WetMudMaterial({ color='#5c4033', wetness=0.6 }: Props) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1.0 - wetness * 0.6}
      metalness={wetness * 0.1}
      envMapIntensity={wetness}
    />
  )
}
