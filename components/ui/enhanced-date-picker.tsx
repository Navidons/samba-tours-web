"use client"

import * as React from "react"
import { format, addDays, isBefore, isAfter, startOfDay, differenceInDays } from "date-fns"
import { CalendarIcon, Info, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EnhancedDatePickerProps {
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  minBookingDays?: number
  maxBookingDays?: number
  disabled?: boolean
  className?: string
  showDateRange?: boolean
  duration?: string
  required?: boolean
  showBookingNotice?: boolean
  customDisabledDates?: (date: Date) => boolean
}

export function EnhancedDatePicker({
  selectedDate,
  onDateSelect,
  label = "Select Date",
  placeholder = "Pick a date",
  minBookingDays = 7,
  maxBookingDays = 365,
  disabled = false,
  className,
  showDateRange = false,
  duration,
  required = false,
  showBookingNotice = true,
  customDisabledDates
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const today = startOfDay(new Date())
  const minBookingDate = addDays(today, minBookingDays)
  const maxBookingDate = addDays(today, maxBookingDays)

  // Disable dates function
  const disabledDates = (date: Date) => {
    const startOfDate = startOfDay(date)
    const isBeforeMin = isBefore(startOfDate, minBookingDate)
    const isAfterMax = isAfter(startOfDate, maxBookingDate)
    const isCustomDisabled = customDisabledDates ? customDisabledDates(date) : false
    
    return isBeforeMin || isAfterMax || isCustomDisabled
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date)
    setIsOpen(false)
  }

  // Calculate end date if duration is provided
  const getEndDate = () => {
    if (!selectedDate || !duration) return null
    
    const durationDays = parseInt(duration.split(' ')[0]) || 1
    return addDays(selectedDate, durationDays - 1)
  }

  // Calculate days until selected date
  const getDaysUntilDate = () => {
    if (!selectedDate) return null
    return differenceInDays(selectedDate, today)
  }

  const endDate = getEndDate()
  const daysUntilDate = getDaysUntilDate()

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              selectedDate && "border-green-500 bg-green-50",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
            {selectedDate && (
              <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabledDates}
            initialFocus
            fromMonth={minBookingDate}
            toMonth={maxBookingDate}
            captionLayout="dropdown-buttons"
            showOutsideDays={false}
          />
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              <span>Minimum {minBookingDays} days advance booking required</span>
            </div>
            {selectedDate && daysUntilDate !== null && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={daysUntilDate >= minBookingDays ? "default" : "destructive"}>
                  {daysUntilDate} days until tour
                </Badge>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Date range display */}
      {showDateRange && selectedDate && endDate && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              <strong>Tour Period:</strong> {format(selectedDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
            </span>
          </div>
          {duration && (
            <div className="mt-1 text-xs text-gray-500">
              {duration} • {Math.ceil((endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24) + 1)} days
            </div>
          )}
        </div>
      )}

      {/* Booking notice alert */}
      {showBookingNotice && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please book at least <strong>{minBookingDays} days</strong> in advance to ensure availability and proper arrangements.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation message */}
      {selectedDate && daysUntilDate !== null && daysUntilDate < minBookingDays && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This date is less than {minBookingDays} days away. Please select a later date.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 
