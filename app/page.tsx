import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, History, FileText } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                From Image to Insight – <span className="text-blue-600">Instantly</span>.
              </h1>
              <p className="text-xl text-gray-600">
                Upload your chest X-ray and receive an automated medical report powered by advanced AI technology.
              </p>
              <div className="pt-4">
                <Link href="/upload">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Chest X-ray illustration"
                  width={400}
                  height={400}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-blue-600" />}
              title="Upload X-Ray"
              description="Select and upload a chest X-ray image directly from your device."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-600" />}
              title="AI Analysis"
              description="Our advanced AI model analyzes the image and generates a detailed medical report."
            />
            <FeatureCard
              icon={<History className="h-10 w-10 text-blue-600" />}
              title="View History"
              description="Access your previously uploaded images and their corresponding reports."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 bg-blue-50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your first X-ray image and receive an instant medical report.
          </p>
          <Link href="/upload">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Upload X-Ray <Upload className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
