import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try to count scans
    const scanCount = await prisma.scan.count()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      scanCount
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 