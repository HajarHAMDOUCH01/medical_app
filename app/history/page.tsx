"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Trash2 } from "lucide-react"
import { getHistory, clearHistory, deleteReportById } from "@/lib/history"
import { useToast } from "@/hooks/use-toast"

type Report = {
  id: string
  timestamp: string
  filename: string
  imageUrl: string
  report: {
    findings: string
    impression: string
    recommendation: string
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const history = getHistory()
    setReports(history)
  }

  const handleViewReport = (id: string) => {
    router.push(`/results?id=${id}`)
  }

  const handleDeleteReport = (id: string) => {
    deleteReportById(id)
    loadHistory()

    toast({
      title: "Report deleted",
      description: "The report has been removed from your history.",
    })
  }

  const handleClearHistory = () => {
    clearHistory()
    loadHistory()

    toast({
      title: "History cleared",
      description: "All reports have been removed from your history.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Your Report History</h1>

        {reports.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearHistory}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All History
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h2>
          <p className="text-gray-500 mb-6">You haven't generated any X-ray reports yet.</p>
          <Button onClick={() => router.push("/upload")} className="bg-blue-600 hover:bg-blue-700">
            Upload Your First X-Ray
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{report.filename}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="aspect-video relative mb-3 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={report.imageUrl || "/placeholder.svg"}
                    alt="X-ray thumbnail"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-gray-500">Uploaded on {formatDate(report.timestamp)}</p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{report.report.impression}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewReport(report.id)}
                >
                  View Report
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
