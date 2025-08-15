import { useState, useEffect } from 'react'

interface UseViewportHeightOptions {
  headerHeight?: number
  footerHeight?: number
  extraOffset?: number // Additional offset for other UI elements
}

export const useViewportHeight = ({
  headerHeight = 80, // Approximate header height
  footerHeight = 64, // Approximate footer height (py-3 = 12px top/bottom + content)
  extraOffset = 150, // Offset for summary, table headers, search bar, margins
}: UseViewportHeightOptions = {}) => {
  const [availableHeight, setAvailableHeight] = useState(400) // Default fallback

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight
      const calculatedHeight =
        viewportHeight - headerHeight - footerHeight - extraOffset

      // Ensure minimum height
      const finalHeight = Math.max(calculatedHeight, 300)

      setAvailableHeight(finalHeight)
    }

    // Calculate initial height
    calculateHeight()

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight)

    // Cleanup listener
    return () => window.removeEventListener('resize', calculateHeight)
  }, [headerHeight, footerHeight, extraOffset])

  return availableHeight
}

// Keep the old hook for backward compatibility but mark it as deprecated
export const useResponsiveHeight = useViewportHeight
