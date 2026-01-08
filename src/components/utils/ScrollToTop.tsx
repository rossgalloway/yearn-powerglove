import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export default function ScrollToTop() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = router.subscribe('onResolved', () => {
      window.scrollTo(0, 0) // Scroll to the top of the page
    }) // Specify 'navigate' as the event type

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [router])

  return null
}
