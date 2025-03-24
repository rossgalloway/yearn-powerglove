"use client"

import type React from "react"

interface ChartContainerProps {
  children: React.ReactNode
  className?: string
}

export function FixedHeightChartContainer({ children, className = "" }: ChartContainerProps) {
  return (
    <div className={`${className} relative h-[400px]`}>
      <div
        className="absolute inset-0"
        style={
          {
            "--chart-1": "#46a2ff",
            "--chart-2": "#a4bbd2",
            "--chart-3": "#6786db",
          } as React.CSSProperties
        }
      >
        {/* This div will force all children to take full height */}
        <div className="h-full w-full">
          {/* Apply styles to override aspect-ratio */}
          <style jsx global>{`
            .aspect-video {
              aspect-ratio: auto !important;
              height: 100% !important;
            }
          `}</style>
          {children}
        </div>
      </div>
    </div>
  )
}

