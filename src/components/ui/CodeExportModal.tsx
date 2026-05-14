import { useState } from 'react'
import { useStudioStore } from '../../store/useStudioStore'
import { generateCode, generatePackageJson, generateInstallInstructions } from '../../utils/codeGenerator'

type ExportTab = 'code' | 'package' | 'setup'

const TAB_LABELS: Record<ExportTab, string> = {
  code: '</> JSX Code',
  package: '📦 package.json',
  setup: '🚀 Setup',
}

export function CodeExportModal() {
  const { objects, scene, camera, showExport, setShowExport } = useStudioStore()
  const [tab, setTab] = useState<ExportTab>('code')
  const [copied, setCopied] = useState(false)

  if (!showExport) return null

  const content =
    tab === 'code'    ? generateCode(objects, scene, camera) :
    tab === 'package' ? generatePackageJson(objects) :
                        generateInstallInstructions()

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="modal-overlay" onClick={() => setShowExport(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Export — React Three Fiber</span>
          <div className="modal-actions">
            <button className="btn primary" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button className="btn" onClick={() => setShowExport(false)}>✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {(Object.keys(TAB_LABELS) as ExportTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 0', fontSize: 11, fontWeight: tab === t ? 700 : 400,
              background: tab === t ? 'var(--surface2)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-dim)',
              border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
            }}>{TAB_LABELS[t]}</button>
          ))}
        </div>

        <div className="modal-body">
          <pre className="modal-code">{content}</pre>
        </div>
      </div>
    </div>
  )
}
