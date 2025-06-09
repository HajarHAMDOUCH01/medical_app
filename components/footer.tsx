import Link from "next/link"
import { Activity } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">MedScan AI</span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/upload" className="hover:text-blue-600">
              Upload
            </Link>
            <Link href="/history" className="hover:text-blue-600">
              History
            </Link>
            <p>© {new Date().getFullYear()} MedScan AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
