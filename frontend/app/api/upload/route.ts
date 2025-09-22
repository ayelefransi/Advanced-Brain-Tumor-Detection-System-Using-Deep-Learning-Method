import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;

    if (!file || !patientId) {
      return NextResponse.json(
        { error: 'File and patientId are required' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const base64Image = `data:${file.type};base64,${base64String}`;

    console.log('Sending image to analysis...');
    
    // Send to Flask backend
    const response = await fetch('http://localhost:8080/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        patientId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis failed: ${errorText}`);
    }

    const analysisData = await response.json();
    console.log('Analysis completed:', analysisData);

    // Upload original to Supabase
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('scans')
      .upload(`scan-${Date.now()}.jpg`, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('scans')
      .getPublicUrl(uploadData.path);

    // Create database record
    const scan = await prisma.scan.create({
      data: {
        userId: "user123", // TODO: Replace with actual user ID
        patientId,
        originalImage: publicUrl,
        segmentationMask: analysisData.segmentationMask,
        tumorType: analysisData.tumorType,
        confidence: analysisData.confidence,
        hasTumor: analysisData.hasTumor,
        processingTime: 0,
        imageUrl: publicUrl
      }
    });
    
    return NextResponse.json({
      success: true,
      scan,
      analysis: analysisData
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 