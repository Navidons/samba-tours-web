"use client"

import { useEffect } from "react"

export default function CopyProtection() {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Disable copy, cut, and paste
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            return false
        }

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault()
            return false
        }

        // Disable keyboard shortcuts for copying
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable Ctrl+C, Ctrl+X, Ctrl+U (view source), Ctrl+S (save), F12 (dev tools)
            if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
                (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
                (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
                (e.metaKey && (e.key === 'c' || e.key === 'C')) ||
                (e.metaKey && (e.key === 'x' || e.key === 'X')) ||
                (e.metaKey && (e.key === 'u' || e.key === 'U')) ||
                (e.metaKey && (e.key === 's' || e.key === 'S')) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c'))
            ) {
                e.preventDefault()
                return false
            }
        }

        // Disable text selection via mouse drag
        const handleSelectStart = (e: Event) => {
            e.preventDefault()
            return false
        }

        // Disable drag and drop
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault()
            return false
        }

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('copy', handleCopy)
        document.addEventListener('cut', handleCut)
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('selectstart', handleSelectStart)
        document.addEventListener('dragstart', handleDragStart)

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('cut', handleCut)
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('selectstart', handleSelectStart)
            document.removeEventListener('dragstart', handleDragStart)
        }
    }, [])

    return null // This component doesn't render anything
}

