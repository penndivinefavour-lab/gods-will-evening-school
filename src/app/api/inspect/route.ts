import { NextResponse } from 'next/server'
import { inspectDatabase } from '@/lib/api/inspect'

export async function GET() {
  const data = await inspectDatabase()
  return NextResponse.json(data)
}
