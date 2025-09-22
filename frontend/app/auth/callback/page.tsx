'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: `Google OAuth error: ${error}`
        })
        router.push('/login')
        return
      }
      
      if (!code) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "No authorization code received"
        })
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(error)
        }

        const data = await response.json()

        // Store auth data
        localStorage.setItem('token', data.token)
        localStorage.setItem('isNewUser', String(data.isNewUser))
        localStorage.setItem('user', JSON.stringify(data.user))

        toast({
          title: "Success",
          description: "Successfully signed in with Google"
        })

        // Add a small delay before navigation
        setTimeout(() => {
          if (data.isNewUser) {
            router.push('/patient-info')
          } else {
            router.push('/upload')
          }
        }, 500)

      } catch (error) {
        console.error('Callback error:', error)
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: error instanceof Error ? error.message : "Failed to complete Google sign in"
        })
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, searchParams, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
} 