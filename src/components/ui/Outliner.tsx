import { useStudioStore, type ObjectType } from '../../store/useStudioStore'

const TYPE_ICON: Record<ObjectType, string> = {
  sphere:   '⬤',
  cube:     '⬛',
  torus:    '◎',
  cylinder: '⬬',
  plane:    '▬',
  glb:      '📦',
}

export function Outliner() {
  const { objects, selectedId, selectObject, toggleVisible } = useStudioStore()

  return (
    <div className="studio-outliner">
      <div className="panel-header">Hierarchy</div>
      <div className="outliner-list">
        {objects.length === 0 && (
          <div className="props-empty">No objects yet.<br />Add one from the toolbar.</div>
        )}
        {objects.map(obj => (
          <div
            key={obj.id}
            className={`outliner-item${selectedId === obj.id ? ' selected' : ''}${!obj.visible ? ' hidden' : ''}`}
            onClick={() => selectObject(obj.id)}
          >
            <span className="obj-icon">{TYPE_ICON[obj.type]}</span>
            <span className="obj-name">{obj.name}</span>
            <button
              className="vis-btn"
              title={obj.visible ? 'Hide' : 'Show'}
              onClick={e => { e.stopPropagation(); toggleVisible(obj.id) }}
            >
              {obj.visible ? '👁' : '🙈'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
