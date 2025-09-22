'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Download, Filter, Calendar, Brain, TrendingUp, Users, ArrowUpRight, Activity, Zap, Sparkles, Clock, Target } from 'lucide-react'
import { saveAs } from 'file-saver'
import { PDFDocument, rgb } from 'pdf-lib'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from "next-auth/react"
import { motion } from 'framer-motion'
import TopNav from '@/components/TopNav'
import SideNav from '@/components/SideNav'

interface Analytics {
  totalScans: number
  tumorDetections: number
  avgConfidence: number
  avgProcessingTime: number
  tumorDistribution: Record<string, number>
  accuracy: number
}

interface ScanData {
  date: string
  scans: number
  tumors: number
  accuracy: number
}

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50"
      animate={{
        background: [
          'linear-gradient(to bottom right, #F8FAFC, #F1F5F9, #F3F4F6)',
          'linear-gradient(to bottom right, #EFF6FF, #F8FAFC, #F5F3FF)',
        ],
      }}
      transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
    />
    <div className="absolute inset-0 opacity-20">
      <div className="h-full w-full bg-grid-pattern" />
    </div>
  </div>
)

const StatCard = ({ title, value, icon: Icon, trend, description }: any) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative"
  >
    <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className="flex items-center text-sm text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                  {trend}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Icon className="h-8 w-8 text-primary relative" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [scanData, setScanData] = useState<ScanData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching analytics data...')
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      // Set analytics summary
      setAnalytics(data.summary)

      // Set trend data for charts
      setScanData(data.trends.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: item.totalScans,
        tumors: item.tumorDetections,
        accuracy: item.accuracy
      })))
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data')
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch analytics data"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500">Loading analytics data...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Analytics</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const tumorTypes = analytics?.tumorDistribution ? 
    Object.entries(analytics.tumorDistribution).map(([name, value]) => ({
      name,
      value,
      color: {
        'Meningioma': '#3b82f6',
        'Glioma': '#ef4444',
        'Pituitary': '#10b981',
        'No Tumour': '#6366f1'
      }[name] || '#6b7280'
    })) : []

  const handleExportReport = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()

      // Add title
      page.drawText('Brain Tumor Analysis Report', {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0, 0, 0),
      })

      if (analytics) {
        // Add real stats
        const stats = [
          { title: 'Total Scans', value: analytics.totalScans.toString(), change: '+' },
          { title: 'Detection Rate', value: `${(analytics.tumorDetections / analytics.totalScans * 100).toFixed(1)}%`, change: '+' },
          { title: 'Avg. Processing Time', value: `${analytics.avgProcessingTime.toFixed(1)}s`, change: '' },
          { title: 'Accuracy', value: `${(analytics.accuracy * 100).toFixed(1)}%`, change: '+' },
        ]

        stats.forEach((stat, index) => {
          page.drawText(`${stat.title}: ${stat.value}`, {
            x: 50,
            y: height - 100 - (index * 25),
            size: 12,
            color: rgb(0, 0, 0),
          })
        })
      }

      // Add timestamp
      page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
        x: 50,
        y: 50,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      })

      // Save the PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      saveAs(blob, `brain-tumor-analysis-${new Date().toISOString().split('T')[0]}.pdf`)

      toast({
        title: "Success",
        description: "Report has been downloaded"
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to generate report"
      })
    }
  }

  return (
    <div className="min-h-screen">
      <TopNav session={session} />
      <SideNav />
      <AnimatedBackground />
      
      <div className="pt-32 px-4 md:pl-72 md:pr-8 pb-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <motion.h1 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Analytics Dashboard
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {session?.user?.name || 'Guest'}
              </motion.p>
            </div>

            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px] bg-background/60 backdrop-blur-xl border-none">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportReport}
                className="bg-background/30 backdrop-blur-xl border-none"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Scans"
              value={analytics?.totalScans || 0}
              icon={Brain}
              trend="+12.5%"
              description="Total scans processed"
            />
            <StatCard
              title="Detection Rate"
              value={analytics ? `${(analytics.tumorDetections / analytics.totalScans * 100).toFixed(1)}%` : '0%'}
              icon={Target}
              trend="+4.3%"
              description="Tumor detection accuracy"
            />
            <StatCard
              title="Processing Time"
              value={analytics ? `${analytics.avgProcessingTime.toFixed(1)}s` : '0s'}
              icon={Clock}
              trend="-0.3s"
              description="Average processing time"
            />
            <StatCard
              title="Model Accuracy"
              value={analytics ? `${(analytics.accuracy * 100).toFixed(1)}%` : '0%'}
              icon={Sparkles}
              trend="+2.1%"
              description="AI model performance"
            />
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Scan Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={scanData}>
                        <defs>
                          <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="scans"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#scanGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Tumor Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tumorTypes}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {tumorTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {tumorTypes.map((type) => (
                        <div key={type.name} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm text-gray-600">{type.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scanData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[0, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 