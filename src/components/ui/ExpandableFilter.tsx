import React, { useState, ReactNode } from 'react'

interface ExpandableFilterProps {
  /** The collapsed button content (icon + text) */
  buttonContent: ReactNode
  /** The expanded content that shows on hover */
  expandedContent: ReactNode
  /** Optional className for the container */
  className?: string
  /** Whether the component should expand on hover */
  expandOnHover?: boolean
}

export const ExpandableFilter: React.FC<ExpandableFilterProps> = ({
  buttonContent,
  expandedContent,
  className = '',
  expandOnHover = true,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = expandOnHover && isHovered

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Button container - always visible */}
      <div
        className={`border rounded-md transition-all duration-200 ${
          isHovered ? 'border-gray-400 shadow-sm' : 'border-gray-300'
        } bg-white px-3 py-2 whitespace-nowrap`}
      >
        {buttonContent}
      </div>

      {/* Expanded content - shows on hover as overlay */}
      {isExpanded && (
        <div
          className="absolute top-0 left-0 z-50 bg-white border border-gray-400 rounded-md shadow-lg px-3 py-2 flex items-center transition-all duration-200"
          style={{ minWidth: '100%' }}
        >
          {/* Button content (same as collapsed) */}
          <div className="flex items-center whitespace-nowrap mr-4">
            {buttonContent}
          </div>
          {/* Expanded content */}
          <div className="flex items-center">{expandedContent}</div>
        </div>
      )}
    </div>
  )
}
