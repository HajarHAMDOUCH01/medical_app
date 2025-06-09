"use client"

import Link from "next/link"
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  const isMobile = useMobile()

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">MedScan AI</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/upload">
            <Button variant="ghost" size={isMobile ? "sm" : "default"}>
              Upload
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size={isMobile ? "sm" : "default"}>
              History
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
