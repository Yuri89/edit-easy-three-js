import { useControls, folder } from 'leva'

export function useGlassControls() {
  return useControls({
    Background: folder({
      bgMode: { value: 'Blobs', options: ['Blobs', 'Solid', 'Gradient'], label: 'Mode' },
      bgColor1: { value: '#e8005a', label: 'Color 1' },
      bgColor2: { value: '#0055ff', label: 'Color 2' },
    }),
    Bloom: folder({
      bloomEnabled: { value: true, label: 'Enabled' },
      bloomIntensity: { value: 0.4, min: 0, max: 3, step: 0.05, label: 'Intensity' },
      bloomThreshold: { value: 0.7, min: 0, max: 1, step: 0.01, label: 'Threshold' },
      chromaticAberration: { value: 0.06, min: 0, max: 0.3, step: 0.005, label: 'Chrom. Ab.' },
    }),
    Environment: folder({
      hdri: {
        value: 'city',
        options: ['None', 'apartment', 'city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset', 'warehouse'],
        label: 'HDRI',
      },
    }),
  })
}

export type GlassControls = ReturnType<typeof useGlassControls>
