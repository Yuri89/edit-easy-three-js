import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import { useStudioStore } from '../../store/useStudioStore'

export function CameraController() {
  const { camera } = useThree()
  const camState = useStudioStore(s => s.camera)
  const fx = useStudioStore(s => s.cameraEffects)
  const lastSync = useRef(0)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    camera.fov = camState.fov
    camera.near = camState.near
    camera.far = camState.far
    camera.updateProjectionMatrix()
  }, [camera, camState.fov, camState.near, camState.far])

  useEffect(() => {
    camera.position.set(...camState.position)
  }, [camera, camState.position[0], camState.position[1], camState.position[2]])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (fx.cameraShake) {
      const i = fx.cameraShakeIntensity * 0.01
      camera.position.x = camState.position[0] + Math.sin(t * 13.7) * i
      camera.position.y = camState.position[1] + Math.sin(t * 11.3) * i * 0.7
      camera.position.z = camState.position[2] + Math.sin(t * 9.1)  * i * 0.4
      return
    }

    // Sync real camera position (post-OrbitControls) back to store ~4fps
    if (t - lastSync.current < 0.25) return
    lastSync.current = t
    const p = camera.position
    const [sx, sy, sz] = camState.position
    if (Math.abs(p.x - sx) > 0.001 || Math.abs(p.y - sy) > 0.001 || Math.abs(p.z - sz) > 0.001) {
      useStudioStore.getState().updateCamera({
        position: [
          parseFloat(p.x.toFixed(3)),
          parseFloat(p.y.toFixed(3)),
          parseFloat(p.z.toFixed(3)),
        ]
      })
    }
  })

  return null
}

