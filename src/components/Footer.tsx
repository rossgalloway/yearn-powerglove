export default function Footer() {
  return (
    <footer className="border-t border-border bg-white py-6 mt-0">
      <div className="container px-8">
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
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Docs
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms of Service
            </a>
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              About Yearn
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
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
