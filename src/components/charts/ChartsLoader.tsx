import React from 'react'

interface ChartsLoaderProps {
  loadingState?: string
}

const ChartsLoader: React.FC<ChartsLoaderProps> = ({
  loadingState = 'loading charts',
}) => {
  return (
    <div className="absolute inset-0 bg-white/20 flex items-center justify-center z-10">
      <div className="flex flex-col items-center justify-center opacity-20">
        <div className="relative flex items-center justify-center w-12 h-12">
          {/* Spinning border circles around the logo */}
          <div className="absolute inset-0 w-12 h-12 border-2 border-t-transparent border-[#0657F9] rounded-full animate-spin"></div>
          <img
            src="/logo.svg"
            alt="Yearn Finance Logo"
            width={32}
            height={32}
            className="z-10 mx-auto"
          />
        </div>
        <div className="mt-3 text-sm text-[#0657F9] font-medium text-center">
          {loadingState}
        </div>
      </div>
    </div>
  )
}

export default ChartsLoader
