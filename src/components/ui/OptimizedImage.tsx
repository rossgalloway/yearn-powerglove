import React, { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  onLoad?: () => void
  onError?: () => void
  placeholder?: React.ReactNode
  loading?: 'lazy' | 'eager'
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onLoad,
  onError,
  placeholder,
  loading = 'lazy',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setImageLoaded(false)
    setImageError(false)

    // Preload the image
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setImageError(false)
      onLoad?.()
    }
    img.onerror = () => {
      setImageError(true)
      setImageLoaded(false)
      onError?.()
    }
    img.src = src
  }, [src, onLoad, onError])

  if (imageError) {
    return (
      <div
        className={`bg-gray-300 rounded-full flex items-center justify-center text-white ${fallbackClassName}`}
      >
        ?
      </div>
    )
  }

  return (
    <div className="relative w-6 h-6">
      {/* Loading placeholder */}
      {!imageLoaded &&
        (placeholder || (
          <div className="absolute inset-0 bg-gray-300 rounded-full animate-pulse" />
        ))}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        loading={loading}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
    </div>
  )
}

export default OptimizedImage
