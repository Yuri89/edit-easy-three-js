import { useEffect, useMemo } from 'react'
import { DepthOfField, Vignette, Noise, Glitch } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Color, Vector2 } from 'three'
import { useStudioStore } from '../../store/useStudioStore'
import { LensDistortionEffect } from './effects/LensDistortionEffect'
import { HeatDistortionEffect } from './effects/HeatDistortionEffect'
import { NightVisionEffect } from './effects/NightVisionEffect'
import { ThermalEffect } from './effects/ThermalEffect'
import { VHSEffect } from './effects/VHSEffect'
import { CCTVEffect } from './effects/CCTVEffect'
import { AnamorphicFlareEffect } from './effects/AnamorphicFlareEffect'
import { LensFlareEffect } from './effects/LensFlareEffect'
import { UnderwaterEffect } from './effects/UnderwaterEffect'
import { DreamGlowEffect } from './effects/DreamGlowEffect'
import { DroneHudEffect } from './effects/DroneHudEffect'

// ─── Helper ──────────────────────────────────────────────────────────────────
function setBF(effect: { blendMode: { blendFunction: BlendFunction } }, enabled: boolean) {
  effect.blendMode.blendFunction = enabled ? BlendFunction.NORMAL : BlendFunction.SKIP
}

// ─── Individual pass components ──────────────────────────────────────────────
export function LensDistortionPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new LensDistortionEffect(), [])
  useEffect(() => {
    setBF(effect, fx.lensDistortion)
    effect.setStrength(fx.lensDistortionStrength)
  }, [effect, fx.lensDistortion, fx.lensDistortionStrength])
  return <primitive object={effect} dispose={null} />
}

export function HeatDistortionPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new HeatDistortionEffect(), [])
  useEffect(() => {
    setBF(effect, fx.heatDistortion)
    effect.setStrength(fx.heatDistortionStrength)
    effect.setSpeed(fx.heatDistortionSpeed)
  }, [effect, fx.heatDistortion, fx.heatDistortionStrength, fx.heatDistortionSpeed])
  return <primitive object={effect} dispose={null} />
}

export function NightVisionPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new NightVisionEffect(), [])
  useEffect(() => {
    setBF(effect, fx.nightVision)
    effect.setIntensity(fx.nightVisionIntensity)
  }, [effect, fx.nightVision, fx.nightVisionIntensity])
  return <primitive object={effect} dispose={null} />
}

export function ThermalPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new ThermalEffect(), [])
  useEffect(() => { setBF(effect, fx.thermal) }, [effect, fx.thermal])
  return <primitive object={effect} dispose={null} />
}

export function VHSPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new VHSEffect(), [])
  useEffect(() => {
    setBF(effect, fx.vhsCrt)
    effect.setIntensity(fx.vhsIntensity)
  }, [effect, fx.vhsCrt, fx.vhsIntensity])
  return <primitive object={effect} dispose={null} />
}

export function CCTVPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new CCTVEffect(), [])
  useEffect(() => { setBF(effect, fx.cctv) }, [effect, fx.cctv])
  return <primitive object={effect} dispose={null} />
}

export function AnamorphicFlarePass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new AnamorphicFlareEffect(), [])
  useEffect(() => {
    setBF(effect, fx.anamorphicFlare)
    effect.setIntensity(fx.anamorphicFlareIntensity)
  }, [effect, fx.anamorphicFlare, fx.anamorphicFlareIntensity])
  return <primitive object={effect} dispose={null} />
}

export function LensFlarePass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new LensFlareEffect(), [])
  useEffect(() => {
    setBF(effect, fx.lensFlare)
    effect.setIntensity(fx.lensFlareIntensity)
  }, [effect, fx.lensFlare, fx.lensFlareIntensity])
  return <primitive object={effect} dispose={null} />
}

export function UnderwaterPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new UnderwaterEffect(), [])
  useEffect(() => {
    setBF(effect, fx.underwater)
    effect.setStrength(fx.underwaterStrength)
  }, [effect, fx.underwater, fx.underwaterStrength])
  return <primitive object={effect} dispose={null} />
}

export function DreamGlowPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new DreamGlowEffect(), [])
  useEffect(() => {
    setBF(effect, fx.dreamGlow)
    effect.setIntensity(fx.dreamGlowIntensity)
    effect.setColor(new Color(fx.dreamGlowColor))
  }, [effect, fx.dreamGlow, fx.dreamGlowIntensity, fx.dreamGlowColor])
  return <primitive object={effect} dispose={null} />
}

export function DroneHudPass() {
  const fx = useStudioStore(s => s.cameraEffects)
  const effect = useMemo(() => new DroneHudEffect(), [])
  useEffect(() => {
    setBF(effect, fx.droneHud)
    effect.setColor(new Color(fx.droneHudColor))
  }, [effect, fx.droneHud, fx.droneHudColor])
  return <primitive object={effect} dispose={null} />
}

// ─── Combined wrapper (single child for EffectComposer) ──────────────────────
export function PostFXPasses() {
  const fx = useStudioStore(s => s.cameraEffects)
  const glitchStrength = new Vector2(fx.glitchStrength, fx.glitchStrength * 0.5)
  return (
    <>
      {fx.dof && (
        <DepthOfField
          focusDistance={fx.dofFocusDistance}
          focalLength={fx.dofFocalLength}
          bokehScale={fx.dofBokehScale}
        />
      )}
      {fx.vignette && (
        <Vignette offset={fx.vignetteOffset} darkness={fx.vignetteDarkness} />
      )}
      {fx.filmGrain && (
        <Noise opacity={fx.filmGrainIntensity} />
      )}
      {fx.glitch && (
        <Glitch active strength={glitchStrength} />
      )}
      <LensDistortionPass />
      <HeatDistortionPass />
      <NightVisionPass />
      <ThermalPass />
      <VHSPass />
      <CCTVPass />
      <AnamorphicFlarePass />
      <LensFlarePass />
      <UnderwaterPass />
      <DreamGlowPass />
      <DroneHudPass />
    </>
  )
}
