'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Activity, Target, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

interface AnalysisResult {
  preview: string
  segmentationMask: string
  tumorType: string
  confidence: number
  hasTumor: boolean
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [showMask, setShowMask] = useState(false)

  useEffect(() => {
    if (!searchParams) return
    const data = searchParams.get('data')
    if (data) {
      setResults(JSON.parse(decodeURIComponent(data)))
    }
  }, [searchParams])

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Brain className="h-16 w-16 text-blue-500 animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold">Loading Results...</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="mb-8 flex items-center"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/upload')}
            className="mr-4 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Results</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Comparison */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg"
          >
            <img
              src={results.preview}
              alt="Original scan"
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={false}
              animate={{ x: showMask ? '0%' : '100%' }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute inset-0"
            >
              <img
                src={`data:image/png;base64,${results.segmentationMask}`}
                alt="Segmentation mask"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <Button
              variant="secondary"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
              onClick={() => setShowMask(!showMask)}
            >
              {showMask ? 'Show Original' : 'Show Segmentation'}
            </Button>
          </motion.div>

          {/* Analysis Details */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Status Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Diagnosis Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-bold mb-4 ${
                    results.hasTumor ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {results.hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
                </motion.div>
                <Progress 
                  value={results.confidence * 100} 
                  className="h-2 bg-gray-100 dark:bg-gray-700"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Confidence: {(results.confidence * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            {/* Classification Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Classification Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-semibold">{results.tumorType}</span>
                  </div>
                  {results.hasTumor && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Medical Attention Required</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={() => router.push('/upload')} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Analyze Another Scan
              </Button>
              <Button 
                onClick={() => window.print()} 
                variant="outline"
                className="flex-1"
              >
                Download Report
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

