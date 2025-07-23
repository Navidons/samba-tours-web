import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface InclusionItem {
  id: string
  item: string
  category?: string
  displayOrder: number
}

interface ExclusionItem {
  id: string
  item: string
  displayOrder: number
}

interface TourInclusionsProps {
  inclusions?: {
    included: string[]
    excluded: string[]
  }
  included?: InclusionItem[] | string[]
  excluded?: ExclusionItem[] | string[]
}

export default function TourInclusions({ inclusions, included, excluded }: TourInclusionsProps) {
  // Handle both prop structures
  const includedItems = inclusions?.included || included || []
  const excludedItems = inclusions?.excluded || excluded || []

  // Helper function to get item text
  const getItemText = (item: any): string => {
    if (typeof item === 'string') {
      return item
    }
    if (item && typeof item === 'object' && 'item' in item) {
      return item.item
    }
    return String(item)
  }

  // Don't render if no data
  if (includedItems.length === 0 && excludedItems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Included */}
      {includedItems.length > 0 && (
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              <span>What's Included</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {includedItems.map((item, index) => (
                <div key={typeof item === 'object' && item.id ? item.id : index} className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{getItemText(item)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Excluded */}
      {excludedItems.length > 0 && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span>What's Not Included</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {excludedItems.map((item, index) => (
                <div key={typeof item === 'object' && item.id ? item.id : index} className="flex items-start space-x-3">
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{getItemText(item)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
