import { Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white py-6 mt-0">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-6">
            <a
              href="/docs"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Docs
            </a>
            <a
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms of Service
            </a>
            <a
              href="/about"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              About Yearn
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Disclaimer
            </a>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-[#0657f9] flex items-center justify-center text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7.5 12.5L10.5 15.5L16.5 9.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="ml-2 text-lg font-bold">Yearn</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
