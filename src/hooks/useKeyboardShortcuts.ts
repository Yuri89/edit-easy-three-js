import { useEffect } from 'react'
import { useStudioStore } from '../store/useStudioStore'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in an input field
      const tag = (e.target as HTMLElement).tagName
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
        || (e.target as HTMLElement).isContentEditable

      const { selectedId, removeObject, selectObject, duplicateObject,
        setTransformMode, undo, redo } = useStudioStore.getState()

      // Ctrl / Cmd combos — always allowed (even in inputs for undo/redo)
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (ctrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault()
        redo()
        return
      }
      if (ctrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        if (selectedId) duplicateObject(selectedId)
        return
      }

      // Single-key shortcuts — skip when editing text
      if (isEditing) return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedId) removeObject(selectedId)
          break
        case 'Escape':
          selectObject(null)
          break
        case 't':
        case 'T':
          setTransformMode('translate')
          break
        case 'r':
        case 'R':
          setTransformMode('rotate')
          break
        case 's':
        case 'S':
          setTransformMode('scale')
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
