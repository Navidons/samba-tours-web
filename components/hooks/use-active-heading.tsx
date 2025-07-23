"use client"

import { useState, useEffect, useRef } from "react"

export function useActiveHeading(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        // Find the entry that is intersecting and is highest on the page
        const intersectingEntries = entries.filter((e) => e.isIntersecting)
        if (intersectingEntries.length > 0) {
          // Sort by position on the page to handle multiple intersections
          intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActiveId(intersectingEntries[0].target.id)
        }
      },
      {
        // This margin makes the heading active when it's in the top 40% of the viewport,
        // which feels more natural for a reader.
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    )

    const elements = headingIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)

    elements.forEach((el) => observer.current?.observe(el))

    return () => {
      observer.current?.disconnect()
    }
  }, [headingIds])

  return activeId
}
