"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, ArrowLeft, Share2 } from "lucide-react"
import { getReportById } from "@/lib/history"
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

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  const reportId = searchParams.get("id")

  useEffect(() => {
    if (!reportId) {
      router.push("/upload")
      return
    }

    const fetchReport = () => {
      try {
        const reportData = getReportById(reportId)
        if (reportData) {
          setReport(reportData)
        } else {
          router.push("/upload")
        }
      } catch (error) {
        console.error("Error fetching report:", error)
        router.push("/upload")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId, router])

  const handleCopyReport = () => {
    if (!report) return

    const reportText = `
FINDINGS:
${report.report.findings}

IMPRESSION:
${report.report.impression}

RECOMMENDATION:
${report.report.recommendation}
    `.trim()

    navigator.clipboard.writeText(reportText)

    toast({
      title: "Report copied to clipboard",
      description: "You can now paste the report text anywhere.",
    })
  }

  const handleShare = async () => {
    if (!report) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "X-Ray Report",
          text: `Findings: ${report.report.findings}\nImpression: ${report.report.impression}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Report not found.</p>
          <Button onClick={() => router.push("/upload")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(report.timestamp).toLocaleString()

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/upload")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">X-Ray Report Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>X-Ray Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Image
                src={report.imageUrl || "/placeholder.svg"}
                alt="X-ray image"
                width={400}
                height={400}
                className="w-full h-auto max-h-[400px] object-contain rounded-md"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Uploaded: {formattedDate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="findings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="impression">Impression</TabsTrigger>
                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
              </TabsList>
              <TabsContent value="findings" className="mt-4 space-y-4">
                <p className="text-gray-700">{report.report.findings}</p>
              </TabsContent>
              <TabsContent value="impression" className="mt-4 space-y-4">
                <p className="text-gray-700">{report.report.impression}</p>
              </TabsContent>
              <TabsContent value="recommendation" className="mt-4 space-y-4">
                <p className="text-gray-700">{report.report.recommendation}</p>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={handleCopyReport}>
                <Copy className="mr-2 h-4 w-4" /> Copy Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
