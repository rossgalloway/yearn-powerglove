import { useState, useEffect, ReactNode } from 'react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 768px)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    // Initialize from current media query state
    setIsMobile(mq.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

export default function MobileChartGate({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const [revealed, setRevealed] = useState(false)

  if (isMobile && !revealed) {
    return (
      <button
        className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          if (
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(orientation: portrait)').matches
          ) {
            alert('Rotate your device to landscape for the best viewing experience.')
          }
          setRevealed(true)
        }}
      >
        View chart
      </button>
    )
  }

  return <>{children}</>
}
