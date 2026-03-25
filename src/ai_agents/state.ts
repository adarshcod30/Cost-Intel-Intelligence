import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const PipelineStateAnnotation = Annotation.Root({
  run_id: Annotation<string>(),
  scenario: Annotation<string>(),
  started_at: Annotation<string>(),
  sample_size: Annotation<number>(),
  window_minutes: Annotation<number>(),
  
  // Data
  invoices: Annotation<any[]>(),
  tickets: Annotation<any[]>(),
  
  // Model Findings
  anomalies: Annotation<any[]>(),
  sla_risks: Annotation<any[]>(),
  
  // Analysis
  root_cause_analysis: Annotation<any[]>(),
  analysis_summary: Annotation<string>(),
  
  // Action Plan
  action_plan: Annotation<any[]>(),
  
  // Results
  auto_executed: Annotation<any[]>(),
  pending_approval: Annotation<any[]>(),
  
  errors: Annotation<string[]>(),
});

export type PipelineState = typeof PipelineStateAnnotation.State;
