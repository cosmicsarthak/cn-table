// lib/hooks/useScrollDirection.ts
import { useEffect, useState } from "react"

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")

  useEffect(() => {
    let lastScrollY = window.scrollY

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? "down" : "up"
      if (direction !== scrollDirection && Math.abs(currentScrollY - lastScrollY) > 10) {
        setScrollDirection(direction)
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", updateScrollDirection)
    return () => window.removeEventListener("scroll", updateScrollDirection)
  }, [scrollDirection])

  return scrollDirection
}
