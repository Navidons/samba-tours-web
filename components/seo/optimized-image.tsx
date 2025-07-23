import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string
  title?: string
  caption?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  className?: string
}

export default function OptimizedImage({
  alt,
  title,
  caption,
  loading = 'lazy',
  priority = false,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    )
  }

  return (
    <figure className="relative">
      <div className={`relative overflow-hidden ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
        
        <Image
          {...props}
          alt={alt}
          title={title || alt}
          loading={loading}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          // SEO optimizations
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
} 
