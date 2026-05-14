import { useRef } from 'react'
import { useStudioStore, type TransformMode } from '../../store/useStudioStore'

const PRIMITIVES: { type: any; icon: string; label: string }[] = [
  { type: 'sphere',   icon: '⬤',  label: 'Sphere'   },
  { type: 'cube',     icon: '⬛',  label: 'Cube'     },
  { type: 'torus',    icon: '◎',  label: 'Torus'    },
  { type: 'cylinder', icon: '⬬',  label: 'Cylinder' },
  { type: 'plane',    icon: '▬',  label: 'Plane'    },
  { type: 'text',     icon: 'T',  label: 'Text'     },
]

const MODES: { mode: TransformMode; icon: string; key: string }[] = [
  { mode: 'translate', icon: '✛', key: 'T' },
  { mode: 'rotate',    icon: '↻', key: 'R' },
  { mode: 'scale',     icon: '⤡', key: 'S' },
]

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { addObject, removeObject, duplicateObject, selectedId, transformMode, setTransformMode, setShowExport } = useStudioStore()

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    addObject('glb', url)
    e.target.value = ''
  }

  return (
    <div className="studio-toolbar">
      {/* Add primitives */}
      <span className="tb-label">Add</span>
      {PRIMITIVES.map(p => (
        <button key={p.type} className="btn" title={p.label} onClick={() => addObject(p.type)}>
          <span>{p.icon}</span>{p.label}
        </button>
      ))}
      <button className="btn" title="Import GLB" onClick={() => fileRef.current?.click()}>
        📂 Import GLB
      </button>
      <input ref={fileRef} type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={handleImport} />

      <div className="tb-sep" />

      {/* Transform modes */}
      <span className="tb-label">Mode</span>
      {MODES.map(m => (
        <button
          key={m.mode}
          className={`btn${transformMode === m.mode ? ' active' : ''}`}
          title={`${m.mode} (${m.key})`}
          onClick={() => setTransformMode(m.mode)}
        >
          {m.icon} {m.key}
        </button>
      ))}

      <div className="tb-sep" />

      {/* Object actions */}
      <button
        className="btn"
        disabled={!selectedId}
        title="Duplicate"
        onClick={() => selectedId && duplicateObject(selectedId)}
      >
        ⧉ Duplicate
      </button>
      <button
        className="btn danger"
        disabled={!selectedId}
        title="Delete selected"
        onClick={() => selectedId && removeObject(selectedId)}
      >
        🗑 Delete
      </button>

      <div style={{ flex: 1 }} />

      {/* Export */}
      <button className="btn primary" onClick={() => setShowExport(true)}>
        {'</>'} Export Code
      </button>
    </div>
  )
}
