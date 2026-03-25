# CostIntel — Enterprise Cost Intelligence & Autonomous Action

**Multi-Agent AI Pipeline for Cost Leakage Detection & Automated Remediation**

CostIntel is an enterprise-grade AI system designed for the **ET GenAI Hackathon 2026**. It transforms static enterprise data into a live, probabilistic simulation of cost intelligence, powered by a 7-agent LangGraph.js pipeline and AWS serverless infrastructure.

## 🚀 Key Features

- **7-Agent LangGraph.js Pipeline**: Ingest → Anomaly → SLA → RootCause → Decision → Action → Audit.
- **AWS Bedrock Reasoning**: Powered by **Amazon Nova Pro** with automatic **Mistral Large** failover.
- **Serverless Data Backplane**: Every transaction and decision is persisted in **DynamoDB** (Stream, Audit, and Approval tables).
- **Dynamic Simulation Engine**: Generates randomized enterprise scenarios every 30 seconds for a zero-static dashboard experience.
- **Human-in-the-Loop (HITL)**: High-impact actions (P1/P2) are held for human review while low-risk actions (P3) are executed autonomously.
- **Unified Node.js / TS Stack**: Fully migrated from Python to TypeScript for maximum performance and sub-second UI updates.

## 🛠️ Architecture

| Component | Technology |
|---|---|
| **Orchestration** | LangGraph.js (Stateful Multi-Agent AI) |
| **Logic/Reasoning** | Amazon Nova Pro (via Bedrock) |
| **Database** | DynamoDB (Mumbai / `ap-south-1`) |
| **Frontend** | Next.js 14 + Framer Motion |
| **Simulation** | Node.js 20.x Lambda Handlers |

## 🏗️ Setup & Deployment

### 1. Configure Environment
Create a `.env` file in the `dashboard/` directory:

```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
DYNAMO_STREAM_TABLE=costintel-live-stream
DYNAMO_AUDIT_TABLE=costintel-audit-log
DYNAMO_APPROVAL_TABLE=costintel-approvals
```

### 2. Install & Provision
```bash
cd dashboard
npm install
npm run dev
```

### 3. Trigger Simulation
Open `http://localhost:3000` and click **"Run Live Simulation"**. 
This will:
1. Generate new randomized data via `src/synthetic_data_engine/simulator.ts`.
2. Trigger the 7-agent pipeline in `src/ai_agents/orchestrator.ts`.
3. Update the Live AI Activity Feed in real-time.

## 🛡️ Audit & Compliance
Every decision made by the system is uniquely fingerprinted with a `RunID` and stored in the **Technical Audit Trail**. This includes raw LLM reasoning, confidence scores, and financial impact assessments.
