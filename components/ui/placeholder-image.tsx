import { cn } from "@/lib/utils"

interface PlaceholderImageProps {
  width?: number
  height?: number
  text?: string
  className?: string
  alt?: string
}

export default function PlaceholderImage({
  width = 400,
  height = 300,
  text = "Image",
  className,
  alt = "Placeholder image"
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium",
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
      role="img"
      aria-label={alt}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">📷</div>
        <div className="text-sm">{text}</div>
      </div>
    </div>
  )
}

// Responsive placeholder component
export function ResponsivePlaceholder({
  aspectRatio = "16/9",
  text = "Image",
  className,
  alt = "Placeholder image"
}: {
  aspectRatio?: string
  text?: string
  className?: string
  alt?: string
}) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium relative",
        className
      )}
      style={{
        aspectRatio,
      }}
      role="img"
      aria-label={alt}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">📷</div>
        <div className="text-sm">{text}</div>
      </div>
    </div>
  )
} 