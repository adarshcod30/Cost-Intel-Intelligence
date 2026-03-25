import { NextResponse } from 'next/server';
import { runPipeline } from '@/ai_agents/orchestrator';
import { runSimulation } from '@/synthetic_data_engine/simulator';

export async function POST(request: Request) {
  try {
    // 1. Generate fresh data in DynamoDB
    await runSimulation();
    
    // 2. Run the 7-agent pipeline (strict 1-minute lookback)
    const result = await runPipeline(1);
    
    return NextResponse.json({ 
      success: true, 
      run_id: result.run_id 
    });
  } catch (error: any) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
