"use client"

import { useState, useEffect } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { RichTextEditor } from './rich-text-editor'

interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'number' | 'rich-text'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: string
}

interface DynamicFormFieldsProps {
  templateId: string
  onDataChange: (data: Record<string, any>) => void
  initialData?: Record<string, any>
}

const templateFields: Record<string, FieldConfig[]> = {
  contactConfirmation: [
    {
      name: 'name',
      label: 'Customer Name',
      type: 'text',
      placeholder: 'Enter customer name',
      required: true,
      defaultValue: 'Test User'
    },
    {
      name: 'email',
      label: 'Customer Email',
      type: 'email',
      placeholder: 'customer@example.com',
      required: true
    },
    {
      name: 'tourType',
      label: 'Tour Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Gorilla Trekking', label: 'Gorilla Trekking' },
        { value: 'Safari Adventure', label: 'Safari Adventure' },
        { value: 'Cultural Tour', label: 'Cultural Tour' },
        { value: 'Mountain Hiking', label: 'Mountain Hiking' },
        { value: 'Lake Victoria Tour', label: 'Lake Victoria Tour' },
        { value: 'Custom Tour', label: 'Custom Tour' }
      ],
      defaultValue: 'Gorilla Trekking'
    },
    {
      name: 'message',
      label: 'Customer Message',
      type: 'textarea',
      placeholder: 'Enter the customer\'s inquiry message',
      required: true,
      defaultValue: 'This is a test message for contact confirmation email.'
    }
  ],
  contactNotification: [
    {
      name: 'name',
      label: 'Customer Name',
      type: 'text',
      placeholder: 'Enter customer name',
      required: true,
      defaultValue: 'Test User'
    },
    {
      name: 'email',
      label: 'Customer Email',
      type: 'email',
      placeholder: 'customer@example.com',
      required: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+256 700 123 456',
      defaultValue: '+256 700 123 456'
    },
    {
      name: 'tourType',
      label: 'Tour Interest',
      type: 'select',
      required: true,
      options: [
        { value: 'Gorilla Trekking', label: 'Gorilla Trekking' },
        { value: 'Safari Adventure', label: 'Safari Adventure' },
        { value: 'Cultural Tour', label: 'Cultural Tour' },
        { value: 'Mountain Hiking', label: 'Mountain Hiking' },
        { value: 'Lake Victoria Tour', label: 'Lake Victoria Tour' },
        { value: 'Custom Tour', label: 'Custom Tour' }
      ],
      defaultValue: 'Gorilla Trekking'
    },
    {
      name: 'message',
      label: 'Inquiry Message',
      type: 'textarea',
      placeholder: 'Enter the customer\'s inquiry message',
      required: true,
      defaultValue: 'This is a test message for admin notification.'
    },
    {
      name: 'inquiryId',
      label: 'Inquiry ID',
      type: 'number',
      placeholder: '123',
      defaultValue: '123'
    }
  ],
  newsletterConfirmation: [
    {
      name: 'email',
      label: 'Subscriber Email',
      type: 'email',
      placeholder: 'subscriber@example.com',
      required: true
    },
    {
      name: 'name',
      label: 'Subscriber Name (Optional)',
      type: 'text',
      placeholder: 'Enter subscriber name',
      defaultValue: 'Test User'
    }
  ],
  bookingConfirmation: [
    {
      name: 'bookingId',
      label: 'Booking ID',
      type: 'text',
      placeholder: 'BK-2024-001',
      required: true,
      defaultValue: 'BK-2024-001'
    },
    {
      name: 'customerName',
      label: 'Customer Name',
      type: 'text',
      placeholder: 'Enter customer name',
      required: true,
      defaultValue: 'Test User'
    },
    {
      name: 'customerEmail',
      label: 'Customer Email',
      type: 'email',
      placeholder: 'customer@example.com',
      required: true
    },
    {
      name: 'tourName',
      label: 'Tour Name',
      type: 'text',
      placeholder: 'Gorilla Trekking Adventure',
      required: true,
      defaultValue: 'Gorilla Trekking Adventure'
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'text',
      placeholder: '2024-06-15',
      required: true,
      defaultValue: '2024-06-15'
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'text',
      placeholder: '2024-06-20',
      required: true,
      defaultValue: '2024-06-20'
    },
    {
      name: 'totalAmount',
      label: 'Total Amount ($)',
      type: 'number',
      placeholder: '2500',
      required: true,
      defaultValue: '2500'
    },
    {
      name: 'participants',
      label: 'Number of Participants',
      type: 'number',
      placeholder: '2',
      required: true,
      defaultValue: '2'
    }
  ],
  passwordReset: [
    {
      name: 'name',
      label: 'User Name',
      type: 'text',
      placeholder: 'Enter user name',
      required: true,
      defaultValue: 'Test User'
    },
    {
      name: 'resetLink',
      label: 'Reset Link',
      type: 'text',
      placeholder: 'https://sambatours.com/reset-password?token=...',
      required: true,
      defaultValue: 'https://sambatours.com/reset-password?token=test-token'
    }
  ],
  custom: [
    {
      name: 'customMessage',
      label: 'Custom Message',
      type: 'rich-text',
      placeholder: 'Write your custom message here...',
      required: true
    }
  ]
}

export function DynamicFormFields({ templateId, onDataChange, initialData = {} }: DynamicFormFieldsProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const fields = templateFields[templateId] || []

  useEffect(() => {
    // Initialize form data with default values
    const initialFormData: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue && !formData[field.name]) {
        initialFormData[field.name] = field.defaultValue
      }
    })
    
    if (Object.keys(initialFormData).length > 0) {
      const newData = { ...formData, ...initialFormData }
      setFormData(newData)
      onDataChange(newData)
    }
  }, [templateId])

  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.name] || '',
      onChange: (e: any) => handleFieldChange(field.name, e.target.value)
    }

    switch (field.type) {
      case 'email':
        return <Input {...commonProps} type="email" />
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        )
      
      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'number':
        return <Input {...commonProps} type="number" />
      
      case 'rich-text':
        return (
          <RichTextEditor
            content={formData[field.name] || ''}
            onChange={(content) => handleFieldChange(field.name, content)}
            placeholder={field.placeholder}
          />
        )
      
      default:
        return <Input {...commonProps} type="text" />
    }
  }

  if (fields.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No specific fields for this template. Use the message editor below.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
} 
