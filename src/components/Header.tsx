import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white py-4">
      <div className="container flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#0657f9]"
          >
            <circle
              cx="12"
              cy="12"
              r="11"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M7 12.5L10.5 16L17 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
