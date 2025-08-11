"use client"

import React from "react"

interface SectionHeaderProps {
  title: string
  highlight?: string
  subtitle?: string
  align?: "left" | "center"
  className?: string
}

export default function SectionHeader({ title, highlight, subtitle, align = "center", className = "" }: SectionHeaderProps) {
  const isCenter = align === "center"
  return (
    <div className={`mb-10 ${isCenter ? "text-center" : "text-left"} ${className}`}> 
      <h2 className={`font-playfair font-bold text-gray-900 ${isCenter ? "mx-auto" : ""} `}>
        <span className="block text-3xl sm:text-4xl md:text-5xl">{title}</span>
        {highlight && (
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 text-3xl sm:text-4xl md:text-5xl">
            {highlight}
          </span>
        )}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-gray-600 ${isCenter ? "max-w-3xl mx-auto" : "max-w-3xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}


