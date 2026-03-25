// src/app/api/approve/route.ts
import { NextResponse } from 'next/server'
import { updateActionStatus, getActionsForRun, getAllRuns } from '@/aws/dynamo'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let runId = searchParams.get('run_id')

    // If no run_id provided, get the latest run
    if (!runId) {
      const runs = await getAllRuns()
      if (runs.length === 0) {
        return NextResponse.json({ actions: [] })
      }
      runId = runs[0].run_id
    }

    const actions = await getActionsForRun(runId!)
    return NextResponse.json({ actions, run_id: runId })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

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
