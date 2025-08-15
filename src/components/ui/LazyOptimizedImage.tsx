import React, { useState, useEffect, useRef } from 'react'

interface LazyOptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  onLoad?: () => void
  onError?: () => void
  placeholder?: React.ReactNode
  priority?: 'high' | 'normal' | 'low'
  rootMargin?: string // For intersection observer
}

// Global image loading queue with priority support
class ImageLoadingQueue {
  private queue: Array<{
    src: string
    priority: 'high' | 'normal' | 'low'
    callback: () => void
  }> = []
  private loading = new Set<string>()
  private maxConcurrent = 6 // Limit concurrent image loads
  private currentLoading = 0

  add(src: string, priority: 'high' | 'normal' | 'low', callback: () => void) {
    // Don't add if already loading or loaded
    if (this.loading.has(src)) return

    // Add to queue with priority
    const item = { src, priority, callback }

    // Insert based on priority
    let insertIndex = this.queue.length
    if (priority === 'high') {
      insertIndex = 0
    } else if (priority === 'normal') {
      // Insert after high priority items
      insertIndex = this.queue.findIndex(item => item.priority === 'low')
      if (insertIndex === -1) insertIndex = this.queue.length
    }

    this.queue.splice(insertIndex, 0, item)
    this.processQueue()
  }

  private async processQueue() {
    if (this.currentLoading >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.currentLoading++
    this.loading.add(item.src)

    try {
      await this.loadImage(item.src)
      item.callback()
    } catch (error) {
      console.warn(`Failed to load image: ${item.src}`, error)
      item.callback() // Still call callback to update component state
    } finally {
      this.currentLoading--
      this.loading.delete(item.src)
      // Process next item
      setTimeout(() => this.processQueue(), 0)
    }
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  remove(src: string) {
    const index = this.queue.findIndex(item => item.src === src)
    if (index > -1) {
      this.queue.splice(index, 1)
    }
  }
}

const imageQueue = new ImageLoadingQueue()

export const LazyOptimizedImage: React.FC<LazyOptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onLoad,
  onError,
  placeholder,
  priority = 'normal',
  rootMargin = '50px',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      // Remove from queue if component unmounts before loading
      imageQueue.remove(src)
    }
  }, [src, rootMargin])

  // Load image when visible
  useEffect(() => {
    if (!isVisible || imageLoaded || imageError) return

    const handleImageLoad = () => {
      setImageLoaded(true)
      setImageError(false)
      onLoad?.()
    }

    const handleImageError = () => {
      setImageError(true)
      setImageLoaded(false)
      onError?.()
    }

    // Add to priority queue
    imageQueue.add(src, priority, () => {
      // Create actual image element to trigger browser caching
      const img = new Image()
      img.onload = handleImageLoad
      img.onerror = handleImageError
      img.src = src
    })
  }, [isVisible, src, priority, imageLoaded, imageError, onLoad, onError])

  if (imageError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-300 rounded-full flex items-center justify-center text-white ${fallbackClassName}`}
      >
        ?
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative w-6 h-6">
      {/* Loading placeholder */}
      {!imageLoaded &&
        (placeholder || (
          <div className="absolute inset-0 bg-gray-300 rounded-full animate-pulse" />
        ))}

      {/* Actual image - only render when loaded */}
      {imageLoaded && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-200`}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default LazyOptimizedImage
