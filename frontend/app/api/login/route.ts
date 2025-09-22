import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

const prisma = new PrismaClient()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, googleToken } = body

    if (googleToken) {
      // Handle Google Sign-in
      try {
        const ticket = await client.verifyIdToken({
          idToken: googleToken,
          audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()
        
        if (!payload?.email) {
          throw new Error('Invalid Google token')
        }

        const user = await prisma.user.findUnique({
          where: { email: payload.email }
        })

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Create session or token here
        return NextResponse.json(
          { message: 'Login successful', user },
          { status: 200 }
        )
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Google token' },
          { status: 400 }
        )
      }
    } else {
      // Handle Email/Password Login
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Create session or token here
      return NextResponse.json(
        { message: 'Login successful', user },
        { status: 200 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Error during login' },
      { status: 500 }
    )
  }
} 