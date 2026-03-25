import { NextResponse } from 'next/server';
import { getRunEvents } from '@/aws/dynamo';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const events = await getRunEvents(params.runId);
    
    // Synthesize metrics from events
    const anomalies = events.find(e => e.event === 'anomalies_detected')?.payload || {};
    const sla = events.find(e => e.event === 'sla_risks_predicted')?.payload || {};
    const audit = events.find(e => e.event === 'run_complete')?.payload || {};
    const actions = events.find(e => e.event === 'action_executor')?.payload || {};

    const metrics = {
      run_id: params.runId,
      anomaly_count: anomalies.count || 0,
      estimated_leakage_inr: anomalies.estimated_leakage_inr || 0,
      sla_risk_count: sla.count || 0,
      penalty_at_risk_inr: sla.penalty_at_risk_inr || 0,
      total_actions: (actions.auto_executed_count || 0) + (actions.pending_approval_count || 0),
      total_impact_inr: audit.total_impact || 0,
    };

    return NextResponse.json({ metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
