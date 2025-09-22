'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Upload, Image as ImageIcon, Brain, AlertCircle, Loader2, Sparkles, Zap, ArrowRight, CheckCircle2, Users, LogOut } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { AIChatAssistant } from '@/components/ui/AIChatAssistant'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { Home, BarChart3, History, Settings, Menu } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'
import { usePathname } from 'next/navigation'

interface AnalysisResult {
  tumorType: string
  confidence: number
  segmentationMask: string
  hasTumor: boolean
  preview: string
}

// Add interface for server response
interface ServerResponse {
  classification: {
    class: string;
    confidence: number;
  };
  segmentation_mask: string;
  error?: string;
  originalPath: string;
  maskPath: string;
  imageUrl: string;
}

// Add new component for animated background
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
      {/* Add subtle grid pattern */}
      <div className="h-full w-full bg-grid-pattern" />
    </div>
  </div>
)

// Add loading animation component
const LoadingAnimation = () => (
  <motion.div 
    className="flex items-center justify-center"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-400/30"
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  </motion.div>
)

// Add success animation
const triggerSuccessAnimation = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Add this component for the top navigation
const TopNav = ({ session }: { session: any }) => (
  <motion.div 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-4 left-4 right-4 h-20 bg-background/60 backdrop-blur-xl rounded-2xl border shadow-2xl z-50"
  >
    <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Brain className="h-7 w-7 text-primary relative" />
        </div>
        <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
          NeuroScan AI
        </h1>
      </motion.div>
      
      <div className="hidden md:flex items-center gap-4">
        {session?.user ? (
          <motion.div 
            className="flex items-center gap-4 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-xl border shadow-lg"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center relative">
                {session.user.email?.[0].toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {session.user.email}
              </span>
              <span className="text-xs text-muted-foreground">
                Pro Member
              </span>
            </div>
          </motion.div>
        ) : (
          <Link href="/login">
            <Button variant="default" className="rounded-xl px-6 py-6 text-base relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
                animate={{
                  x: ['0%', '100%'],
                  backgroundSize: ['200% 100%', '200% 100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative">Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  </motion.div>
)

// Add back the SideNav component
const SideNav = () => {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed hidden md:flex left-4 top-24 bottom-4 w-64 bg-background/60 backdrop-blur-xl rounded-2xl border shadow-2xl z-40"
    >
      <div className="flex flex-col h-full p-4">
        <div className="space-y-2">
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              pathname === "/" ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>
          
          <Link 
            href="/upload" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              pathname === "/upload" ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
            )}
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Upload Scan</span>
          </Link>
          
          <Link 
            href="/patients" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              pathname === "/patients" ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Patients</span>
          </Link>
          
          <Link 
            href="/analytics" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              pathname === "/analytics" ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Analytics</span>
          </Link>

          <Link 
            href="/settings" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              pathname === "/settings" ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const [dragEnterCount, setDragEnterCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const progressSpring = useSpring(0, { stiffness: 100, damping: 30 })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      // Check file size (16MB limit)
      if (selectedFile.size > 16 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image under 16MB"
        })
        return
      }

      if (!selectedFile.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an MRI scan image (JPEG, PNG)"
        })
        return
      }

      // Reset states when new file is selected
      setFile(selectedFile)
      setResult(null)
      setProgress(0)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Add drop animation
      setDragEnterCount(0)
      const dropAnimation = [
        { transform: 'scale(0.95)', opacity: 0.7 },
        { transform: 'scale(1.02)', opacity: 0.9 },
        { transform: 'scale(1)', opacity: 1 }
      ]
      document.querySelector('.drop-zone')?.animate(dropAnimation, {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      })
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragEnterCount(prev => prev + 1),
    onDragLeave: () => setDragEnterCount(prev => Math.max(0, prev - 1)),
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1
  })

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an MRI scan first",
      });
      return;
    }

    // Check for session and user email
    if (!session?.user?.email) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to analyze scans",
      });
      router.push('/login');
      return;
    }
    
    setAnalyzing(true);
    setProgress(0);
    
    const startTime = performance.now();
    
    try {
      // Check if Flask server is running
      try {
        const healthCheck = await fetch('http://localhost:8080/');
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (error) {
        throw new Error('Cannot connect to analysis server. Please make sure the Flask backend is running.');
      }

      console.log('Starting analysis for file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      console.log('Sending request to server...');
      const response = await fetch('http://localhost:8080/analyze', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        mode: 'cors',
      });

      clearInterval(progressInterval);
      
      if (response.status === 413) {
        throw new Error('File size too large. Please select an image under 16MB.');
      }

      let serverResponse: ServerResponse;
      let analysisResult: AnalysisResult;

      try {
        serverResponse = await response.json();
        console.log('Server response:', serverResponse);

        // Check for error in server response
        if (!response.ok || serverResponse.error) {
          throw new Error(serverResponse.error || 'Failed to analyze image');
        }

        // Validate server response structure
        if (!serverResponse.classification || !serverResponse.segmentation_mask) {
          throw new Error('Invalid response format from server');
        }

        // Transform the server response to match expected format
        analysisResult = {
          tumorType: serverResponse.classification.class,
          confidence: serverResponse.classification.confidence,
          segmentationMask: serverResponse.segmentation_mask,
          hasTumor: serverResponse.classification.class !== 'No Tumour',
          preview: serverResponse.imageUrl
        };

        console.log('Transformed result:', analysisResult);
      } catch (error) {
        console.error('Response parsing error:', error);
        throw new Error('Invalid response from server. Please try again.');
      }

      const processingTime = (performance.now() - startTime) / 1000;

      // Save scan result to database
      try {
        console.log('Saving scan result...');
        const userEmail = session.user.email;
        
        if (!userEmail) {
          throw new Error('User email not found in session');
        }
        
        console.log('User email:', userEmail);
        
        const saveResponse = await fetch('/api/scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userEmail,
            originalImage: preview,
            segmentationMask: analysisResult.segmentationMask,
            tumorType: analysisResult.tumorType,
            confidence: analysisResult.confidence,
            hasTumor: analysisResult.hasTumor,
            processingTime,
            originalPath: serverResponse.originalPath,
            maskPath: serverResponse.maskPath,
            imageUrl: preview,
          }),
        });

        if (!saveResponse.ok) {
          const saveData = await saveResponse.json();
          console.error('Save response error:', saveData);
          throw new Error(saveData.error || 'Failed to save analysis results');
        }

        const saveData = await saveResponse.json();
        console.log('Save response:', saveData);

        setProgress(100);
        setResult(analysisResult);
        
        toast({
          title: "Analysis Complete",
          description: `Detected: ${analysisResult.tumorType} (${Math.round(analysisResult.confidence * 100)}% confidence)`,
        });

        // Show success animation
        setShowConfetti(true);
        triggerSuccessAnimation();
        
      } catch (error) {
        console.error('Error saving scan:', error);
        toast({
          variant: "destructive",
          title: "Error Saving Results",
          description: error instanceof Error ? error.message : "Failed to save analysis results"
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setProgress(0);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Success animation
  useEffect(() => {
    if (result) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [result])

  // Update progress with spring animation
  useEffect(() => {
    progressSpring.set(progress)
  }, [progress])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <TopNav session={session} />
      <SideNav />
      
      <div className="pt-32 px-4 md:pl-72 md:pr-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Left Column - Upload Section */}
            <div className="space-y-6">
              <Card className="border-none bg-background/60 backdrop-blur-md shadow-xl">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload MRI Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <motion.div
                    {...getRootProps({
                      onAnimationStart: undefined,
                      onDragStart: undefined,
                      onDragEnter: undefined,
                      onDragOver: undefined,
                      onDragLeave: undefined,
                      onDrop: undefined
                    })}
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-8 transition-all",
                      "group hover:bg-accent/50",
                      isDragActive ? "border-primary bg-primary/5" : "border-muted"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-primary/10 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <Upload className={cn(
                          "h-12 w-12 p-2 rounded-full transition-colors",
                          isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {isDragActive ? "Release to upload" : "Drag & drop or click to upload"}
                      </p>
                    </div>
                  </motion.div>

                  {preview && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6"
                    >
                      <motion.div
                        className="relative"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Button
                          className="w-full h-16 relative overflow-hidden group"
                          onClick={handleAnalyze}
                          disabled={analyzing}
                        >
                          {/* Animated background gradient */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
                            animate={{
                              x: ['0%', '100%'],
                              backgroundSize: ['200% 100%', '200% 100%'],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Animated particles */}
                          <div className="absolute inset-0 overflow-hidden">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute h-2 w-2 rounded-full bg-primary/30"
                                animate={{
                                  y: ['0%', '100%'],
                                  x: [`${30 * i}%`, `${30 * i + 10}%`],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.4,
                                  ease: 'easeInOut',
                                }}
                              />
                            ))}
                          </div>

                          {/* Button content */}
                          <div className="relative flex items-center justify-center gap-3">
                            {analyzing ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Loader2 className="h-5 w-5" />
                                </motion.div>
                                <span className="font-medium">Analyzing Scan...</span>
                              </>
                            ) : (
                              <>
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Brain className="h-5 w-5" />
                                </motion.div>
                                <span className="font-medium">Analyze Scan</span>
                                <motion.div
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </motion.div>
                              </>
                            )}
                          </div>

                          {/* Hover effect ring */}
                          <motion.div
                            className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-sm" />
                          </motion.div>
                        </Button>
                      </motion.div>

                      {analyzing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          {/* Progress bar with animated gradient */}
                          <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
                              animate={{
                                width: `${progress}%`,
                                backgroundPosition: ['0% 50%', '100% 50%'],
                              }}
                              transition={{
                                width: { type: "spring", stiffness: 100, damping: 30 },
                                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                              }}
                            />
                          </div>
                          
                          {/* Animated progress text */}
                          <motion.div 
                            className="mt-2 flex justify-between items-center text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <span>Processing scan...</span>
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              {progress}%
                            </motion.span>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results Section */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card className="border-none bg-background/60 backdrop-blur-md shadow-xl">
                      <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          Analysis Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid gap-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Image Comparison */}
                            <motion.div className="relative aspect-square rounded-xl overflow-hidden"
                              whileHover={{ scale: 1.02 }}
                            >
                              <img
                                src={preview!}
                                alt="Original"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <span className="absolute bottom-2 left-2 text-xs text-white font-medium">
                                Original Scan
                              </span>
                            </motion.div>

                            <motion.div className="relative aspect-square rounded-xl overflow-hidden"
                              whileHover={{ scale: 1.02 }}
                            >
                              <img
                                src={`data:image/png;base64,${result.segmentationMask}`}
                                alt="Segmentation"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <span className="absolute bottom-2 left-2 text-xs text-white font-medium">
                                Segmentation Mask
                              </span>
                            </motion.div>
                          </div>

                          {/* Results Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            <motion.div 
                              className="p-4 rounded-xl bg-accent/50 backdrop-blur-sm"
                              whileHover={{ scale: 1.02 }}
                            >
                              <p className="text-xs text-muted-foreground mb-1">Type</p>
                              <p className="font-medium truncate">{result.tumorType}</p>
                            </motion.div>
                            <motion.div 
                              className="p-4 rounded-xl bg-accent/50 backdrop-blur-sm"
                              whileHover={{ scale: 1.02 }}
                            >
                              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                              <p className="font-medium">{Math.round(result.confidence * 100)}%</p>
                            </motion.div>
                            <motion.div 
                              className="p-4 rounded-xl bg-accent/50 backdrop-blur-sm"
                              whileHover={{ scale: 1.02 }}
                            >
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              <p className="font-medium">{result.hasTumor ? 'Detected' : 'None'}</p>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Assistant */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AIChatAssistant 
                        scanDetails={{
                          tumorType: result.tumorType,
                          confidence: result.confidence,
                          hasTumor: result.hasTumor
                        }} 
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center text-muted-foreground">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Upload a scan to see analysis results</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Status Indicator */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-md shadow-lg rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <p className="text-sm">Processing your scan...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
