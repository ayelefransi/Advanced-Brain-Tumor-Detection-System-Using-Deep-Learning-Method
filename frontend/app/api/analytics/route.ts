import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    console.log('Analytics API called')
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month'
    console.log('Time range:', range)

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
        startDate.setMonth(now.getMonth() - 1)
    }

    console.log('Fetching scans from', startDate, 'to', now)

    // Get scans within the date range
    const scans = await prisma.scan.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log('Found', scans.length, 'scans')

    // Return empty data if no scans found
    if (scans.length === 0) {
      console.log('No scans found, returning empty data')
      return NextResponse.json({
        summary: {
          totalScans: 0,
          tumorDetections: 0,
          avgConfidence: 0,
          avgProcessingTime: 0,
          tumorDistribution: {},
          accuracy: 0,
        },
        trends: [],
      })
    }

    // Calculate analytics
    const totalScans = scans.length
    const tumorScans = scans.filter(scan => scan.hasTumor)
    const tumorDetections = tumorScans.length
    const avgConfidence = scans.reduce((acc, scan) => acc + scan.confidence, 0) / totalScans || 0
    const avgProcessingTime = scans.reduce((acc, scan) => acc + scan.processingTime, 0) / totalScans || 0

    // Calculate tumor distribution
    const tumorDistribution = scans.reduce((acc, scan) => {
      const type = scan.tumorType
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('Calculated tumor distribution:', tumorDistribution)

    // Group scans by date for trend data
    const trendData = scans.reduce((acc, scan) => {
      const date = new Date(scan.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          totalScans: 0,
          tumorDetections: 0,
          avgConfidence: 0,
          processingTimes: [] as number[],
        }
      }
      acc[date].totalScans++
      if (scan.hasTumor) acc[date].tumorDetections++
      acc[date].avgConfidence += scan.confidence
      acc[date].processingTimes.push(scan.processingTime)
      return acc
    }, {} as Record<string, any>)

    // Calculate daily averages
    const dailyData = Object.values(trendData).map(day => ({
      date: day.date,
      totalScans: day.totalScans,
      tumorDetections: day.tumorDetections,
      accuracy: (day.avgConfidence / day.totalScans) * 100,
      avgProcessingTime: day.processingTimes.reduce((a: number, b: number) => a + b, 0) / day.processingTimes.length,
    }))

    console.log('Processed daily data:', dailyData.length, 'days')

    const response = {
      summary: {
        totalScans,
        tumorDetections,
        avgConfidence,
        avgProcessingTime,
        tumorDistribution,
        accuracy: avgConfidence,
      },
      trends: dailyData,
    }

    console.log('Sending response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
} 