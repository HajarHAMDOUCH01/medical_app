"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileImage, Loader2 } from "lucide-react"
import { saveToHistory } from "@/lib/history"

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0] || null

    if (!file) {
      setSelectedFile(null)
      setPreview(null)
      return
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      setSelectedFile(null)
      setPreview(null)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError("Please select an image to upload.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create form data to send the file
      const formData = new FormData()
      formData.append("image", selectedFile)

      // In a real application, you would send this to your API
      // For now, we'll simulate an API call with a timeout

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock report data
      const reportData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        filename: selectedFile.name,
        imageUrl: preview,
        report: {
          findings:
            "The lungs are clear without focal consolidation, pneumothorax, or pleural effusion. The cardiomediastinal silhouette is normal. The visualized osseous structures are intact.",
          impression: "No acute cardiopulmonary process.",
          recommendation: "Follow-up imaging in 6 months is recommended.",
        },
      }

      // Save to history
      saveToHistory(reportData)

      // Navigate to results page with the report data
      router.push(`/results?id=${reportData.id}`)
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to process the image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Upload Chest X-Ray</h1>

      <Card className="w-full">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              {preview ? (
                <div className="relative w-full max-w-md">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt="X-ray preview"
                    width={400}
                    height={400}
                    className="w-full h-auto max-h-[400px] object-contain rounded-md border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-white"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-12 w-full max-w-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <FileImage className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center mb-2">Click to select or drag and drop your X-ray image</p>
                  <p className="text-sm text-gray-500 text-center">Supported formats: JPG, PNG, DICOM</p>
                </div>
              )}

              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {error && <div className="text-red-500 text-center text-sm">{error}</div>}

            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full max-w-md"
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
