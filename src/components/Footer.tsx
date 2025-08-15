import { ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-white py-3 mt-0">
      <div className="container px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Yearn PowerGlove Logo"
              className="w-6 h-6"
            />
            <span className="ml-2 text-lg font-bold text-accent">Yearn</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://docs.yearn.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center" // Added flex and items-center
            >
              Docs <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            {/* TODO: add page or remove link */}
            <a
              href="/about"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              About Yearn
            </a>
            {/* TODO: add page or remove link */}
            <a
              href="/privacy"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {/* TODO: add page or remove link */}
              Disclaimer
            </a>
          </div>

          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </footer>
  )
}
