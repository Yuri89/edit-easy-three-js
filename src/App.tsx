import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneSetup } from './components/three/SceneSetup'
import { StudioObject } from './components/three/StudioObject'
import { CameraController } from './components/three/CameraController'
import { Toolbar } from './components/ui/Toolbar'
import { Outliner } from './components/ui/Outliner'
import { PropertiesPanel } from './components/ui/PropertiesPanel'
import { CodeExportModal } from './components/ui/CodeExportModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useStudioStore } from './store/useStudioStore'
import './styles/studio.css'

export default function App() {
  const { objects, selectedId } = useStudioStore()
  useKeyboardShortcuts()

  return (
    <div className="studio-root">
      <Toolbar />
      <div className="studio-body">
        <Outliner />

        <div className="studio-canvas-wrap">
          <Canvas
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 6], fov: 50 }}
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            onCreated={({ gl }) => { gl.shadowMap.enabled = false }}
            onPointerMissed={() => useStudioStore.getState().selectObject(null)}
          >
            <Suspense fallback={null}>
              <CameraController />
              <SceneSetup orbitEnabled={selectedId === null} />
              {objects.map(obj => (
                <StudioObject key={obj.id} obj={obj} />
              ))}
            </Suspense>
          </Canvas>
        </div>

        <PropertiesPanel />
      </div>

      <CodeExportModal />
    </div>
  )
}
