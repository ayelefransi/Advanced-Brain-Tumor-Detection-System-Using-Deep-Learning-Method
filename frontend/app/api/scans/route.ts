import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const scans = await prisma.scan.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(scans)
  } catch (error) {
    console.error('Error fetching scans:', error)
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.userId) {
      console.error('Missing userId in request')
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { email: data.userId }
    })

    if (!user) {
      console.error('User not found:', data.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Creating scan with data:', {
      userId: data.userId,
      tumorType: data.tumorType,
      confidence: data.confidence,
      hasTumor: data.hasTumor
    })

    const scan = await prisma.scan.create({
      data: {
        userId: data.userId,
        originalImage: data.originalImage || '',
        segmentationMask: data.segmentationMask || '',
        tumorType: data.tumorType,
        confidence: data.confidence,
        hasTumor: data.hasTumor,
        processingTime: data.processingTime || 0,
        originalPath: data.originalPath || '',
        maskPath: data.maskPath || '',
        imageUrl: data.imageUrl || '',
      }
    })

    console.log('Scan created successfully:', scan.id)

    if (data.patientId) {
      // Update patient's scan count
      await prisma.patient.update({
        where: { id: data.patientId },
        data: {
          scanCount: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(scan)
  } catch (error) {
    console.error('Error creating scan:', error)
    // Return more detailed error information
    return NextResponse.json({ 
      error: 'Failed to create scan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}