import { useState, useRef, useEffect } from 'react'
import { useVaults } from '@/contexts/useVaults'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ExternalLink, Menu } from 'lucide-react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'

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
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-0 sm:px-8">
        <Link to="/" className="flex items-center gap-2 cursor-pointer min-w-0">
          <img
            src="/logo.svg"
            alt="Yearn PowerGlove Logo"
            className="w-6 h-6"
          />
          <span className="text-lg font-bold">Yearn PowerGlove</span>
        </Link>
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-4 relative">
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
            className="border border-gray-300 rounded px-3 py-2 w-64 md:w-80"
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

        {/* Mobile actions: burger opens a drawer with search, links, and CTA */}
        <div className="sm:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 p-0 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 space-y-3">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search vaults..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full border border-gray-300 rounded px-3 py-3"
                />
                {isDropdownOpen && searchTerm && (
                  <div
                    ref={dropdownRef}
                    className="max-h-60 overflow-y-auto rounded border"
                  >
                    {filteredVaults.map(vault => (
                      <Link
                        key={vault.address}
                        to="/vaults/$chainId/$vaultAddress"
                        params={{
                          chainId: vault.chainId.toString(),
                          vaultAddress: vault.address,
                        }}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex gap-2 items-center"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          setSearchTerm('')
                        }}
                      >
                        <span className="truncate">{vault.name}</span>
                        <span className="text-gray-600 text-xs">
                          {vault.apiVersion}
                        </span>
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
                    className="w-full text-[#0657f9] border-[#0657f9] rounded-none flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Partner with us
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                {/* Footer links moved into mobile drawer */}
                <div className="pt-2 space-y-2">
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Links
                  </div>
                  <a
                    href="https://docs.yearn.fi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Docs
                  </a>
                  <a
                    href="/about"
                    className="block px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    About Yearn
                  </a>
                  <a
                    href="/privacy"
                    className="block px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/disclaimer"
                    className="block px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Disclaimer
                  </a>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <a
                    href="https://x.com/yearnfi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <img
                      src="/twitter-x.svg"
                      alt="X (formerly Twitter)"
                      className="h-5 w-5"
                    />
                  </a>
                  <a
                    href="https://yearn.fi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <img
                      src="/yearn-link-icon.svg"
                      alt="Yearn.fi"
                      className="h-5 w-5"
                    />
                  </a>
                  <a
                    href="https://github.com/yearn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <img src="/github-icon.svg" alt="GitHub" className="h-5 w-5" />
                  </a>
                </div>
                <DrawerClose asChild>
                  <Button className="w-full" variant="secondary">
                    Close
                  </Button>
                </DrawerClose>
              </div>
              <DrawerFooter />
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
