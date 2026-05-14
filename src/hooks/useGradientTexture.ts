import { useMemo, useEffect } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { GradientStop } from '../store/useStudioStore'

export function useGradientTexture(
  enabled: boolean,
  stops: GradientStop[],
  angleDeg: number,
) {
  // stable key so useMemo re-runs only when something actually changes
  const stopsKey = stops.map(s => `${s.position}:${s.color}`).join('|')

  const texture = useMemo(() => {
    if (!enabled || stops.length < 2) return null
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const rad = (angleDeg * Math.PI) / 180
    const cx = size / 2
    const cy = size / 2
    const r = size / 2
    const x1 = cx - Math.cos(rad) * r
    const y1 = cy - Math.sin(rad) * r
    const x2 = cx + Math.cos(rad) * r
    const y2 = cy + Math.sin(rad) * r
    const grad = ctx.createLinearGradient(x1, y1, x2, y2)
    // sort stops by position before drawing
    const sorted = [...stops].sort((a, b) => a.position - b.position)
    sorted.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.position)), s.color))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, stopsKey, angleDeg])

  useEffect(() => {
    return () => { texture?.dispose() }
  }, [texture])

  return texture
}
