import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white py-2">
      <div className="container flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Yearn PowerGlove Logo"
            className="w-6 h-6"
          />
          <span className="text-lg font-bold">Yearn PowerGlove</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[#0657f9] border-[#0657f9] rounded-none"
        >
          Partner with us
        </Button>
      </div>
    </header>
  )
}
