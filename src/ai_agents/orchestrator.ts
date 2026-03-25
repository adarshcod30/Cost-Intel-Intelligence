import { StateGraph, END, START } from "@langchain/langgraph";
import { v4 as uuidv4 } from 'uuid';
import { PipelineStateAnnotation, PipelineState } from './state';
import { 
  ingestionNode, 
  anomalyNode, 
  slaNode, 
  analysisNode, 
  actionNode, 
  auditNode 
} from './nodes';
import { logEvent } from '../aws_infrastructure/dynamo';

const createGraph = () => {
  const workflow = new StateGraph(PipelineStateAnnotation)
    .addNode('ingest', ingestionNode)
    .addNode('detect', anomalyNode)
    .addNode('sla', slaNode)
    .addNode('analyze', analysisNode)
    .addNode('act', actionNode)
    .addNode('audit', auditNode);

  workflow.addEdge(START, 'ingest');
  workflow.addEdge('ingest', 'detect');
  workflow.addEdge('detect', 'sla');
  workflow.addEdge('sla', 'analyze');
  workflow.addEdge('analyze', 'act');
  workflow.addEdge('act', 'audit');
  workflow.addEdge('audit', END);

  return workflow.compile();
};

export const runPipeline = async (windowMinutes: number = 30) => {
  const runId = uuidv4().substring(0, 8).toUpperCase();
  const startedAt = new Date().toISOString();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ⚡ CostIntel AI Pipeline — Run ${runId}`);
  console.log(`${'='.repeat(60)}`);

  await logEvent(runId, 'orchestrator', 'run_started', {
    window_minutes: windowMinutes,
    environment: 'production',
  });

  const initialState: Partial<PipelineState> = {
    run_id: runId,
    started_at: startedAt,
    window_minutes: windowMinutes,
    invoices: [],
    tickets: [],
    anomalies: [],
    sla_risks: [],
    action_plan: [],
    errors: [],
  };

  const app = createGraph();
  const result = await app.invoke(initialState as PipelineState);

  console.log(`\n  ✅ Pipeline complete — Run ${runId}`);
  return result;
};

if (require.main === module) {
  runPipeline(30).catch(console.error);
}
