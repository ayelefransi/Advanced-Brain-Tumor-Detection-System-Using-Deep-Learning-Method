import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scanResult } = await request.json()

    // Get today's analytics record or create a new one
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let analytics = await prisma.analytics.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (!analytics) {
      // Create new analytics record for today
      analytics = await prisma.analytics.create({
        data: {
          totalScans: 0,
          tumorDetections: 0,
          avgConfidence: 0,
          avgProcessingTime: 0,
          tumorDistribution: {},
          accuracy: 0,
        },
      })
    }

    // Update analytics with new scan result
    const updatedAnalytics = await prisma.analytics.update({
      where: { id: analytics.id },
      data: {
        totalScans: analytics.totalScans + 1,
        tumorDetections: analytics.tumorDetections + (scanResult.hasTumor ? 1 : 0),
        avgConfidence: (analytics.avgConfidence * analytics.totalScans + scanResult.confidence) / (analytics.totalScans + 1),
        avgProcessingTime: (analytics.avgProcessingTime * analytics.totalScans + scanResult.processingTime) / (analytics.totalScans + 1),
        tumorDistribution: {
          ...analytics.tumorDistribution,
          [scanResult.tumorType]: ((analytics.tumorDistribution as any)[scanResult.tumorType] || 0) + 1,
        },
        // For now, we'll use confidence as a proxy for accuracy
        accuracy: (analytics.accuracy * analytics.totalScans + scanResult.confidence) / (analytics.totalScans + 1),
      },
    })

    return NextResponse.json(updatedAnalytics)
  } catch (error) {
    console.error('Error updating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month'

    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1) // Default to month
    }

    const analytics = await prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 