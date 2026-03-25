// src/app/api/approve/route.ts
import { NextResponse } from 'next/server'
import { updateActionStatus } from '@/aws/dynamo'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action_id, run_id, decision, reviewed_by = 'dashboard_user' } = body

    if (!action_id || !run_id || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await updateActionStatus(action_id, run_id, decision, reviewed_by)
    return NextResponse.json({ action_id, status: decision, message: `Action ${decision} successfully` })

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
