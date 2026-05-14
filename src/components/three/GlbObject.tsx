import { useRef, useMemo, useEffect } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useLoader } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { GLTFLoader } from 'three-stdlib'
import type { TransformControls as TransformControlsImpl } from 'three-stdlib'
import { MeshPhysicalMaterial, Color, Group, Euler, Vector3 } from 'three'
import type { SceneObject, TransformMode } from '../../store/useStudioStore'
import { resolveGlassAppearance } from '../../utils/glassPresets'

interface Props {
  obj: SceneObject
  isSelected: boolean
  transformMode: TransformMode
  onClick: (e: ThreeEvent<MouseEvent>) => void
  onChange: () => void
}

export function GlbObject({ obj, isSelected, transformMode, onClick, onChange }: Props) {
  const groupRef = useRef<Group>(null)
  const tcRef = useRef<TransformControlsImpl>(null)
  const gltf = useLoader(GLTFLoader, obj.glbUrl!)

  const { color, roughness, iridescence } = resolveGlassAppearance(
    obj.mat.preset, obj.mat.color, obj.mat.roughness, obj.mat.iridescence,
  )

  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child as any).isMesh) return
      const mesh = child as any
      if (mesh.material) mesh.material.dispose()
      mesh.material = new MeshPhysicalMaterial({
        transmission: obj.mat.transmission,
        ior: obj.mat.ior,
        thickness: obj.mat.thickness,
        roughness,
        iridescence,
        iridescenceIOR: 1.3,
        envMapIntensity: obj.mat.envMapIntensity,
        color: new Color(color),
        transparent: true,
        side: 2,
      })
    })
  }, [clonedScene, obj.mat, color, roughness, iridescence])

  return (
    <>
      {isSelected && (
        <TransformControls
          ref={tcRef}
          object={groupRef as any}
          mode={transformMode}
          onObjectChange={onChange}
        />
      )}
      <group
        ref={groupRef}
        position={new Vector3(...obj.position)}
        rotation={new Euler(...obj.rotation)}
        scale={new Vector3(...obj.scale)}
        onClick={onClick}
      >
        <primitive object={clonedScene} />
      </group>
    </>
  )
}
