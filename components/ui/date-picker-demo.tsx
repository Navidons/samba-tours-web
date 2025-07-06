"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import { format } from "date-fns"

export default function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date>()

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Picker Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedDatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            label="Tour Start Date"
            placeholder="Select your preferred start date"
            minBookingDays={7}
            maxBookingDays={365}
            showDateRange={true}
            duration="3 days"
            required={true}
          />
          
          {selectedDate && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Selected Date:</h4>
              <p className="text-green-700">{format(selectedDate, "PPP")}</p>
            </div>
          )}
          
          <Button 
            onClick={() => setSelectedDate(undefined)}
            variant="outline"
            className="w-full"
          >
            Clear Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 