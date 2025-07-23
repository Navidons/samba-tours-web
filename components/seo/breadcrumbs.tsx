import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import StructuredData from './structured-data'
import { generateBreadcrumbSchema } from '@/lib/seo'

interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [
    { name: 'Home', url: '/' },
    ...items
  ]

  return (
    <>
      <StructuredData data={generateBreadcrumbSchema(allItems)} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {item.current || index === allItems.length - 1 ? (
                <span 
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {index === 0 ? (
                    <span className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {item.name}
                    </span>
                  ) : (
                    item.name
                  )}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  className="hover:text-orange-600 transition-colors"
                >
                  {index === 0 ? (
                    <span className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {item.name}
                    </span>
                  ) : (
                    item.name
                  )}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
} 
