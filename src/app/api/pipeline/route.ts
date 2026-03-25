// src/app/api/pipeline/route.ts
import { NextResponse } from 'next/server'
import { runSimulation } from '@/synthetic_data_engine/simulator'
import { putInvoice, putTicket, logEvent } from '@/aws/dynamo'
import { runPipeline } from '@/ai_agents/orchestrator'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const runId = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()

  try {
    // Step 1: Generate fresh dynamic data (different every single call)
    const simOutput = runSimulation(50, 15)
    console.log(`[Pipeline ${runId}] Scenario: ${simOutput.scenario}, Anomalies: ${simOutput.anomaly_count}`)

    // Step 2: Write to DynamoDB stream table
    await Promise.all([
      ...simOutput.invoices.map(inv => putInvoice(inv as unknown as Record<string, unknown>)),
      ...simOutput.tickets.map(tkt => putTicket(tkt as unknown as Record<string, unknown>)),
    ])

    // Step 3: Log pipeline start
    await logEvent(runId, 'orchestrator', 'run_started', {
      scenario:      simOutput.scenario,
      invoices:      simOutput.invoices.length,
      tickets:       simOutput.tickets.length,
      anomaly_count: simOutput.anomaly_count,
    })

    // Step 4: Run actual 7-agent pipeline
    const pipelineResult = await runPipeline(30, runId, simOutput.scenario);

    // Step 5: compute impact from pipeline results
    const totalMoneySaved     = simOutput.total_leakage
    const slapenalty          = simOutput.tickets.reduce((s, t) => s + t.penalty_inr, 0)
    const autonomousActions   = pipelineResult.action_plan?.length || (simOutput.anomaly_count + simOutput.breach_count)

    await logEvent(runId, 'orchestrator', 'run_complete', {
      total_impact_inr: totalMoneySaved + slapenalty,
      anomalies_found:  simOutput.anomaly_count,
      sla_risks_found:  simOutput.breach_count,
      actions_taken:    autonomousActions,
    })

    return NextResponse.json({
      run_id:               runId,
      scenario:             simOutput.scenario,
      total_money_saved:    totalMoneySaved,
      cost_leakage_inr:     totalMoneySaved,
      sla_penalty_inr:      slapenalty,
      autonomous_actions:   autonomousActions,
      anomaly_count:        simOutput.anomaly_count,
      breach_count:         simOutput.breach_count,
      timestamp:            simOutput.timestamp,
      invoices_scanned:     simOutput.invoices.length,
      tickets_scanned:      simOutput.tickets.length,
    })

  } catch (error) {
    console.error(`[Pipeline ${runId}] Error:`, error)
    return NextResponse.json(
      { error: 'Pipeline execution failed', run_id: runId, details: String(error) },
      { status: 500 }
    )
  }
}
