import type React from 'react'

interface ChartContainerProps {
  children: React.ReactNode
  className?: string
}

export function FixedHeightChartContainer({
  children,
  className = '',
}: ChartContainerProps) {
  return (
    <div className={`${className} relative h-60 sm:h-72 md:h-[400px]`}>
      <div
        className="absolute inset-0"
        style={
          {
            '--chart-1': '#46a2ff',
            '--chart-2': '#46a2ff',
            '--chart-3': '#6786db',
            '--chart-4': '#b0b5bf',
          } as React.CSSProperties
        }
      >
        {/* This div will force all children to take full height */}
        <div className="h-full w-full">
          {/* Apply styles to override aspect-ratio */}
          <style>{`
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
