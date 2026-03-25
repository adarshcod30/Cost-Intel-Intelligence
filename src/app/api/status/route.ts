// src/app/api/status/route.ts
import { NextResponse } from 'next/server'
import { getStreamStats, getPendingActions, getAllRuns } from '@/aws/dynamo'

export async function GET() {
  try {
    const [stats, pending, runs] = await Promise.all([
      getStreamStats(),
      getPendingActions(),
      getAllRuns(),
    ])
    return NextResponse.json({ stats, pending_count: pending.length, runs })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
