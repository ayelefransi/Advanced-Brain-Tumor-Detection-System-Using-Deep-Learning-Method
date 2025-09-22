'use client'

import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackToHome() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/')}
      className="absolute top-20 left-4"
    >
      <Home className="h-4 w-4 mr-2" />
      Back to Home
    </Button>
  )
} 