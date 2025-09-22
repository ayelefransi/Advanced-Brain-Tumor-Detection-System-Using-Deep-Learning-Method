import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Create a unique filename
    const filename = `${uuidv4()}_${image.name}`
    const uploadDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(uploadDir, filename)

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Write file to disk
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    // Call Python script for analysis
    const pythonScript = path.join(process.cwd(), 'backend/main.py')
    
    const result = await new Promise((resolve, reject) => {
      const process = spawn('python', [pythonScript, filePath])
      let output = ''
      let error = ''

      process.stdout.on('data', (data) => {
        output += data.toString()
      })

      process.stderr.on('data', (data) => {
        error += data.toString()
      })

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${error}`))
          return
        }
        try {
          resolve(JSON.parse(output))
        } catch (e) {
          reject(new Error('Failed to parse Python output'))
        }
      })
    })

    // Clean up uploaded file
    fs.unlinkSync(filePath)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
} 