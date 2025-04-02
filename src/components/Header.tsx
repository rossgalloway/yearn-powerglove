import { useState, useRef, useEffect } from 'react'
import { useVaults } from '@/contexts/useVaults'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function Header() {
  const navigate = useNavigate()
  const { vaults } = useVaults()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // State to control dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null) // Ref for the dropdown
  const searchInputRef = useRef<HTMLInputElement>(null) // Ref for the search input

  // Filter vaults based on the search term
  const filteredVaults = vaults.filter(
    vault =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false) // Close dropdown if clicking outside
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white py-2">
      <div className="container flex items-center justify-between px-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate({ to: '/' })}
        >
          <img
            src="/logo.svg"
            alt="Yearn PowerGlove Logo"
            className="w-6 h-6"
          />
          <span className="text-lg font-bold">Yearn PowerGlove</span>
        </div>
        <div className="flex items-center gap-4 relative">
          {/* Search Bar */}
          <input
            ref={searchInputRef} // Attach the ref to the search input
            type="text"
            placeholder="Search vaults..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setIsDropdownOpen(true) // Open dropdown when typing
            }}
            onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
            className="border border-gray-300 rounded px-2 py-1 w-[300px]"
          />
          {/* Dropdown for filtered vaults */}
          {isDropdownOpen && searchTerm && (
            <div
              ref={dropdownRef} // Attach the ref to the dropdown
              className="absolute bg-white border border-gray-300 rounded shadow-md left-0 right-0 top-full overflow-y-auto"
              style={{
                maxHeight: '50vh', // Half the window height
              }}
            >
              {filteredVaults.map(vault => (
                <div
                  key={vault.address}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 items-center"
                  onClick={() => {
                    navigate({
                      to: `/vaults/${vault.chainId}/${vault.address}`,
                    })
                  }}
                >
                  <span>{vault.name}</span>
                  <span className="text-gray-600 text-sm">
                    {vault.apiVersion}
                  </span>{' '}
                  {/* Added apiVersion */}
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-[#0657f9] border-[#0657f9] rounded-none"
          >
            Partner with us
          </Button>
        </div>
      </div>
    </header>
  )
}
