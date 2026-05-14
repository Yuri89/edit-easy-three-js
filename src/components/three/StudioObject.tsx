import { useRef, useCallback } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { MeshTransmissionMaterial, TransformControls, RoundedBox, Text3D, Center } from '@react-three/drei'
import { type Mesh, type Group } from 'three'
import type { TransformControls as TransformControlsImpl } from 'three-stdlib'
import { useStudioStore, type SceneObject } from '../../store/useStudioStore'
import { resolveGlassAppearance } from '../../utils/glassPresets'
import { GlbObject } from './GlbObject'
import { VolumetricHalo } from './VolumetricHalo'
import { useGradientTexture } from '../../hooks/useGradientTexture'
import { LavaMaterial } from './LavaMaterial'
import { TVScreenMaterial } from './TVScreenMaterial'
import { MetalMaterial } from './MetalMaterial'
import { MercuryMaterial } from './MercuryMaterial'
import { MarbleMaterial } from './MarbleMaterial'
import { IceMaterial } from './IceMaterial'
import { PearlescentMaterial } from './PearlescentMaterial'
import { HolographicMaterial } from './HolographicMaterial'
import { PlasmaMaterial } from './PlasmaMaterial'
import { ForceFieldMaterial } from './ForceFieldMaterial'
import { NebulaMaterial } from './NebulaMaterial'
import { PortalMaterial } from './PortalMaterial'
import { ElectricMaterial } from './ElectricMaterial'
import { MatrixMaterial } from './MatrixMaterial'
import { SlimeMaterial } from './SlimeMaterial'
import { SkinMaterial } from './SkinMaterial'
import { MagmaRockMaterial } from './MagmaRockMaterial'
import { AlienFleshMaterial } from './AlienFleshMaterial'
import { WetMudMaterial } from './WetMudMaterial'
import { FireMaterial } from './FireMaterial'
import { SandMaterial } from './SandMaterial'
import { RainGlassMaterial } from './RainGlassMaterial'
import { AuroraMaterial } from './AuroraMaterial'
import { FogMaterial } from './FogMaterial'
import { CloudMaterial } from './CloudMaterial'

const IRI_RANGE: [number, number] = [0, 1400]

interface Props {
  obj: SceneObject
}

function GlassMesh({ obj }: Props) {
  const mt = obj.mat.materialType

  const { color, roughness, iridescence } = resolveGlassAppearance(
    obj.mat.preset,
    obj.mat.color,
    obj.mat.roughness,
    obj.mat.iridescence,
  )

  const gradientMap = useGradientTexture(
    true,
    obj.mat.gradientStops,
    obj.mat.gradientAngle,
  )

  // Water override: blueish, ior 1.33, distortion
  const waterColor = '#5ab4d6'
  const waterIor = 1.33
  const waterDistortion = 0.15
  const waterDistortionScale = 0.8

  // Crystal override: max iridescence
  const crystalIridescence = 1.0

  let mat: React.ReactNode
  // --- Realistic ---
  if (mt === 'metal') {
    mat = <MetalMaterial preset={obj.mat.metalPreset} color={obj.mat.metalColor} roughness={obj.mat.metalRoughness} />
  } else if (mt === 'mercury') {
    mat = <MercuryMaterial color={obj.mat.mercuryColor} ripple={obj.mat.mercuryRipple} />
  } else if (mt === 'marble') {
    mat = <MarbleMaterial color1={obj.mat.marbleColor1} color2={obj.mat.marbleColor2} veinScale={obj.mat.marbleVeinScale} veinIntensity={obj.mat.marbleVeinIntensity} />
  } else if (mt === 'ice') {
    mat = <IceMaterial color={obj.mat.iceColor} crackIntensity={obj.mat.iceCrackIntensity} frost={obj.mat.iceFrost} />
  } else if (mt === 'pearlescent') {
    mat = <PearlescentMaterial baseColor={obj.mat.pearlBaseColor} shiftIntensity={obj.mat.pearlShiftIntensity} />
  } else if (mt === 'holographic') {
    mat = <HolographicMaterial color={obj.mat.holoColor} scanSpeed={obj.mat.holoScanSpeed} stripeCount={obj.mat.holoStripeCount} />
  // --- Sci-Fi ---
  } else if (mt === 'plasma') {
    mat = <PlasmaMaterial color1={obj.mat.plasmaColor1} color2={obj.mat.plasmaColor2} speed={obj.mat.plasmaSpeed} scale={obj.mat.plasmaScale} />
  } else if (mt === 'forcefield') {
    mat = <ForceFieldMaterial color={obj.mat.ffColor} hexSize={obj.mat.ffHexSize} pulseSpeed={obj.mat.ffPulseSpeed} />
  } else if (mt === 'nebula') {
    mat = <NebulaMaterial color1={obj.mat.nebulaColor1} color2={obj.mat.nebulaColor2} color3={obj.mat.nebulaColor3} speed={obj.mat.nebulaSpeed} />
  } else if (mt === 'portal') {
    mat = <PortalMaterial color1={obj.mat.portalColor1} color2={obj.mat.portalColor2} speed={obj.mat.portalSpeed} distortion={obj.mat.portalDistortion} />
  } else if (mt === 'electric') {
    mat = <ElectricMaterial color={obj.mat.electricColor} intensity={obj.mat.electricIntensity} speed={obj.mat.electricSpeed} />
  } else if (mt === 'matrix') {
    mat = <MatrixMaterial color={obj.mat.matrixColor} speed={obj.mat.matrixSpeed} density={obj.mat.matrixDensity} />
  // --- Organic ---
  } else if (mt === 'lava') {
    mat = <LavaMaterial color1={obj.mat.lavaColor1} color2={obj.mat.lavaColor2} speed={obj.mat.lavaSpeed} scale={obj.mat.lavaScale} />
  } else if (mt === 'slime') {
    mat = <SlimeMaterial color={obj.mat.slimeColor} rippleSpeed={obj.mat.slimeRippleSpeed} />
  } else if (mt === 'skin') {
    mat = <SkinMaterial color={obj.mat.skinColor} subsurfaceColor={obj.mat.skinSubsurfaceColor} subsurfaceIntensity={obj.mat.skinSubsurfaceIntensity} />
  } else if (mt === 'magmarock') {
    mat = <MagmaRockMaterial rockColor={obj.mat.magmaRockColor} crackColor={obj.mat.magmaCrackColor} glow={obj.mat.magmaGlow} speed={obj.mat.magmaSpeed} />
  } else if (mt === 'alienflesh') {
    mat = <AlienFleshMaterial color1={obj.mat.alienColor1} color2={obj.mat.alienColor2} pulseSpeed={obj.mat.alienPulseSpeed} />
  } else if (mt === 'wetmud') {
    mat = <WetMudMaterial color={obj.mat.mudColor} wetness={obj.mat.mudWetness} />
  // --- Environmental ---
  } else if (mt === 'fire') {
    mat = <FireMaterial color1={obj.mat.fireColor1} color2={obj.mat.fireColor2} speed={obj.mat.fireSpeed} scale={obj.mat.fireScale} />
  } else if (mt === 'sand') {
    mat = <SandMaterial color={obj.mat.sandColor} rippleScale={obj.mat.sandRippleScale} windSpeed={obj.mat.sandWindSpeed} />
  } else if (mt === 'rainglass') {
    mat = <RainGlassMaterial intensity={obj.mat.rainIntensity} speed={obj.mat.rainSpeed} dropSize={obj.mat.rainDropSize} />
  } else if (mt === 'aurora') {
    mat = <AuroraMaterial color1={obj.mat.auroraColor1} color2={obj.mat.auroraColor2} color3={obj.mat.auroraColor3} speed={obj.mat.auroraSpeed} />
  } else if (mt === 'fog') {
    mat = <FogMaterial color={obj.mat.fogColor} density={obj.mat.fogDensity} speed={obj.mat.fogSpeed} />
  } else if (mt === 'cloud') {
    mat = <CloudMaterial color={obj.mat.cloudColor} speed={obj.mat.cloudSpeed} opacity={obj.mat.cloudOpacity} />
  // --- TV / Light / Halo ---
  } else if (mt === 'tvscreen') {
    mat = <TVScreenMaterial color={obj.mat.tvColor} scanlines={obj.mat.tvScanlines} noise={obj.mat.tvNoise} brightness={obj.mat.tvBrightness} />
  } else if (mt === 'light') {
    mat = (
      <meshStandardMaterial
        color='#ffffff'
        emissive='#ffffff'
        emissiveIntensity={obj.mat.emissiveIntensity}
        emissiveMap={gradientMap ?? undefined}
        roughness={0.3}
        metalness={0}
      />
    )
  } else if (mt === 'halo') {
    // Invisible mesh — only the halo billboard is visible
    mat = <meshBasicMaterial transparent opacity={0} depthWrite={false} />
  } else {
    // glass / water / crystal — all use MeshTransmissionMaterial
    const tColor = mt === 'water' ? waterColor : color
    const tIor = mt === 'water' ? waterIor : obj.mat.ior
    const tIridescence = mt === 'crystal' ? crystalIridescence : iridescence
    const tDistortion = mt === 'water' ? waterDistortion : obj.mat.distortion
    const tDistortionScale = mt === 'water' ? waterDistortionScale : obj.mat.distortionScale
    mat = (
      <MeshTransmissionMaterial
        transmissionSampler
        backside
        transmission={obj.mat.transmission}
        roughness={roughness}
        ior={tIor}
        thickness={obj.mat.thickness}
        iridescence={tIridescence}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={IRI_RANGE}
        color={tColor}
        envMapIntensity={obj.mat.envMapIntensity}
        distortion={tDistortion}
        distortionScale={tDistortionScale}
        temporalDistortion={mt === 'water' ? 0.05 : 0}
      />
    )
  }

  const isLight = mt === 'light'
  const isHalo = mt === 'halo'

  const light = (isLight || isHalo) ? (
    <pointLight
      color={obj.mat.lightColor}
      intensity={obj.mat.lightIntensity}
      distance={obj.mat.lightDistance}
    />
  ) : null

  const halo = isHalo ? (
    <VolumetricHalo
      color={obj.mat.godRaysColor}
      intensity={obj.mat.godRaysIntensity}
      size={obj.mat.godRaysSize}
    />
  ) : null

  if (obj.type === 'sphere') {
    return <><sphereGeometry args={[0.9, 24, 24]} />{mat}{light}{halo}</>
  }
  if (obj.type === 'torus') {
    return <><torusGeometry args={[0.7, 0.28, 16, 48]} />{mat}{light}{halo}</>
  }
  if (obj.type === 'cylinder') {
    return <><cylinderGeometry args={[0.6, 0.6, 1.4, 32]} />{mat}{light}{halo}</>
  }
  if (obj.type === 'plane') {
    return <><planeGeometry args={[1.6, 1.6]} />{mat}{light}{halo}</>
  }
  // cube — geometry provided by RoundedBox, just return the material
  return <>{mat}</>
}

export function StudioObject({ obj }: Props) {
  const meshRef = useRef<Mesh | Group>(null)
  const tcRef = useRef<TransformControlsImpl>(null)
  const { selectedId, transformMode, selectObject, updateObject } = useStudioStore()
  const isSelected = selectedId === obj.id

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectObject(obj.id)
  }, [obj.id, selectObject])

  // Sync TransformControls changes back to store
  const handleChange = useCallback(() => {
    if (!meshRef.current) return
    const p = meshRef.current.position
    const r = meshRef.current.rotation
    const s = meshRef.current.scale
    updateObject(obj.id, {
      position: [p.x, p.y, p.z],
      rotation: [r.x, r.y, r.z],
      scale: [s.x, s.y, s.z],
    })
  }, [obj.id, updateObject])

  if (!obj.visible) return null

  if (obj.type === 'text') {
    const mt = obj.mat.materialType
    const { color, roughness, iridescence } = resolveGlassAppearance(
      obj.mat.preset, obj.mat.color, obj.mat.roughness, obj.mat.iridescence
    )
    const isLight = mt === 'light'
    const textGradMap = useGradientTexture(
      obj.mat.gradientEnabled,
      obj.mat.gradientStops,
      obj.mat.gradientAngle,
    )

    let textMat: React.ReactNode
    if (mt === 'lava') {
      textMat = <LavaMaterial color1={obj.mat.lavaColor1} color2={obj.mat.lavaColor2} speed={obj.mat.lavaSpeed} scale={obj.mat.lavaScale} />
    } else if (mt === 'tvscreen') {
      textMat = <TVScreenMaterial color={obj.mat.tvColor} scanlines={obj.mat.tvScanlines} noise={obj.mat.tvNoise} brightness={obj.mat.tvBrightness} />
    } else if (mt === 'light') {
      textMat = (
        <meshStandardMaterial
          color={obj.mat.gradientEnabled ? '#ffffff' : obj.mat.emissiveColor}
          emissive={obj.mat.gradientEnabled ? '#ffffff' : obj.mat.emissiveColor}
          emissiveIntensity={obj.mat.emissiveIntensity}
          emissiveMap={obj.mat.gradientEnabled ? (textGradMap ?? undefined) : undefined}
          roughness={0.3} metalness={0}
        />
      )
    } else {
      const tColor = mt === 'water' ? '#5ab4d6' : color
      const tIor = mt === 'water' ? 1.33 : obj.mat.ior
      const tIridescence = mt === 'crystal' ? 1.0 : iridescence
      const tDistortion = mt === 'water' ? 0.15 : obj.mat.distortion
      const tDistortionScale = mt === 'water' ? 0.8 : obj.mat.distortionScale
      textMat = (
        <MeshTransmissionMaterial
          transmissionSampler
          backside
          transmission={obj.mat.transmission}
          roughness={roughness}
          ior={tIor}
          thickness={obj.mat.thickness}
          iridescence={tIridescence}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[0, 1400]}
          color={tColor}
          envMapIntensity={obj.mat.envMapIntensity}
          distortion={tDistortion}
          distortionScale={tDistortionScale}
          temporalDistortion={mt === 'water' ? 0.05 : 0}
        />
      )
    }
    return (
      <>
        <Center
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          onClick={handleClick}
        >
          <Text3D
            ref={meshRef as React.Ref<any>}
            font="/fonts/helvetiker_bold.typeface.json"
            size={obj.textSize ?? 0.6}
            height={obj.textDepth ?? 0.2}
            curveSegments={8}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
          >
            {obj.textContent ?? 'Text'}
            {textMat}
          </Text3D>
        </Center>
        {isSelected && (
          <TransformControls
            ref={tcRef}
            object={meshRef}
            mode={transformMode}
            onObjectChange={handleChange}
          />
        )}
        {(obj.mat.materialType === 'light' || obj.mat.materialType === 'halo') && (
          <pointLight
            position={obj.position}
            color={obj.mat.lightColor}
            intensity={obj.mat.lightIntensity}
            distance={obj.mat.lightDistance}
          />
        )}
        {obj.mat.materialType === 'halo' && (
          <group position={obj.position}>
            <VolumetricHalo
              color={obj.mat.godRaysColor}
              intensity={obj.mat.godRaysIntensity}
              size={obj.mat.godRaysSize}
            />
          </group>
        )}
      </>
    )
  }

  if (obj.type === 'glb' && obj.glbUrl) {
    return (
      <GlbObject
        obj={obj}
        isSelected={isSelected}
        transformMode={transformMode}
        onClick={handleClick}
        onChange={handleChange}
      />
    )
  }

  if (obj.type === 'cube') {
    return (
      <>
        <RoundedBox
          ref={meshRef}
          args={[1.4, 1.4, 1.4]}
          radius={0.15}
          smoothness={4}
          bevelSegments={2}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          onClick={handleClick}
        >
          <GlassMesh obj={obj} />
        </RoundedBox>
        {isSelected && (
          <TransformControls
            ref={tcRef}
            object={meshRef}
            mode={transformMode}
            onObjectChange={handleChange}
          />
        )}
        {(obj.mat.materialType === 'light' || obj.mat.materialType === 'halo') && (
          <pointLight
            position={obj.position}
            color={obj.mat.lightColor}
            intensity={obj.mat.lightIntensity}
            distance={obj.mat.lightDistance}
          />
        )}
        {obj.mat.materialType === 'halo' && (
          <group position={obj.position}>
            <VolumetricHalo
              color={obj.mat.godRaysColor}
              intensity={obj.mat.godRaysIntensity}
              size={obj.mat.godRaysSize}
            />
          </group>
        )}
      </>
    )
  }

  return (
    <>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={handleClick}
      >
        <GlassMesh obj={obj} />
      </mesh>
      {isSelected && (
        <TransformControls
          ref={tcRef}
          object={meshRef}
          mode={transformMode}
          onObjectChange={handleChange}
        />
      )}
      {(obj.mat.materialType === 'light' || obj.mat.materialType === 'halo') && (
        <pointLight
          position={obj.position}
          color={obj.mat.lightColor}
          intensity={obj.mat.lightIntensity}
          distance={obj.mat.lightDistance}
        />
      )}
      {obj.mat.materialType === 'halo' && (
        <group position={obj.position}>
          <VolumetricHalo
            color={obj.mat.godRaysColor}
            intensity={obj.mat.godRaysIntensity}
            size={obj.mat.godRaysSize}
          />
        </group>
      )}
    </>
  )
}
