import React from 'react'

const YearnLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <img
        src="/logo.svg"
        alt="Yearn Finance Logo"
        width={50}
        height={50}
        // className="animate-pulse"
      />
      <div className="absolute flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-t-transparent border-[#0657F9] rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export default YearnLoader
