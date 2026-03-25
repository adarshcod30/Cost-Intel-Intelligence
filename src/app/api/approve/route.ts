import { NextResponse } from 'next/server';
import { updateActionStatus, getPendingActions } from '@/aws_infrastructure/dynamo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('run_id');
  
  try {
    const pending = await getPendingActions(runId || undefined);
    return NextResponse.json({ pending });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action_id, decision, reviewed_by } = await request.json();
    
    if (!action_id || !decision) {
      return NextResponse.json({ error: 'Missing action_id or decision' }, { status: 400 });
    }

    await updateActionStatus(action_id, decision, reviewed_by || 'dashboard_user');
    
    return NextResponse.json({ success: true, action_id, status: decision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
