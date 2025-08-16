import { useState, useRef, useEffect } from 'react'
import { useVaults } from '@/contexts/useVaults'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function Header() {
  const { vaults } = useVaults()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
        setIsDropdownOpen(false)
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
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src="/logo.svg"
            alt="Yearn PowerGlove Logo"
            className="w-6 h-6"
          />
          <span className="text-lg font-bold">Yearn PowerGlove</span>
        </Link>
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
                <Link
                  key={vault.address}
                  to="/vaults/$chainId/$vaultAddress"
                  params={{
                    chainId: vault.chainId.toString(),
                    vaultAddress: vault.address,
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 items-center"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    setSearchTerm('')
                  }}
                >
                  <span>{vault.name}</span>
                  <span className="text-gray-600 text-sm">
                    {vault.apiVersion}
                  </span>{' '}
                </Link>
              ))}
            </div>
          )}
          <a
            href="https://discord.gg/NankxHeU"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-[#0657f9] border-[#0657f9] rounded-none flex items-center gap-2"
            >
              Partner with us
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  )
}
