"use client"

import * as React from "react"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EnhancedDatePickerProps {
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  showDateRange?: boolean
  duration?: string
  required?: boolean
  customDisabledDates?: (date: Date) => boolean
}

export function EnhancedDatePicker({
  selectedDate,
  onDateSelect,
  label = "Select Date",
  placeholder = "Pick a date",
  disabled = false,
  className,
  showDateRange = false,
  duration,
  required = false,
  customDisabledDates
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const today = startOfDay(new Date())

  // Disable dates function - only disable past dates and custom disabled dates
  const disabledDates = (date: Date) => {
    const startOfDate = startOfDay(date)
    const isPastDate = isBefore(startOfDate, today)
    const isCustomDisabled = customDisabledDates ? customDisabledDates(date) : false
    
    return isPastDate || isCustomDisabled
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

  const endDate = getEndDate()

  return (
    <div className="space-y-3">
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
              "w-full justify-start text-left font-normal h-12",
              !selectedDate && "text-muted-foreground",
              selectedDate && "border-emerald-500 bg-emerald-50",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "EEEE, MMMM dd, yyyy") : placeholder}
            {selectedDate && (
              <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-medium text-sm text-gray-900">Select your preferred start date</h4>
            <p className="text-xs text-gray-600 mt-1">Choose any available date for your tour</p>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabledDates}
            initialFocus
            fromMonth={today}
            toMonth={addDays(today, 365)}
            captionLayout="dropdown-buttons"
            showOutsideDays={false}
            className="p-3"
          />
          {selectedDate && (
            <div className="p-3 border-t bg-emerald-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  Selected: {format(selectedDate, "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {/* Date range display */}
      {showDateRange && selectedDate && endDate && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              Tour Period: {format(selectedDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
            </span>
          </div>
          {duration && (
            <div className="mt-1 text-xs text-gray-500">
              {duration} • {Math.ceil((endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24) + 1)} days
            </div>
          )}
        </div>
      )}

      {/* Quick date suggestions */}
      {!selectedDate && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateSelect(addDays(today, 1))}
            className="text-xs h-8"
          >
            Tomorrow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateSelect(addDays(today, 7))}
            className="text-xs h-8"
          >
            Next Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateSelect(addDays(today, 30))}
            className="text-xs h-8"
          >
            Next Month
          </Button>
        </div>
      )}
    </div>
  )
} 
