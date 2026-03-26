</div>

---

<div align="center">
  <h1>⚡ Cost Intel Intelligence</h1>
  <p><b>Enterprise Cost Intelligence & Autonomous Action</b></p>
  <p><i>A 7-agent AI pipeline that watches enterprise finances 24/7, catches cost leakage before money leaves, and acts autonomously — with a human always in the loop for high-stakes decisions.</i></p>

  <br />
  <a href="https://main.d2akwim961corm.amplifyapp.com/">
    <img src="https://img.shields.io/badge/LIVE_DEMO-VIEW_DASHBOARD-813DEF?style=for-the-badge&logo=rocket" alt="Live Demo" />
  </a>
  <p><b>🚀 Deployed on AWS Amplify:</b> <a href="https://main.d2akwim961corm.amplifyapp.com/">main.d2akwim961corm.amplifyapp.com</a></p>
  <br />

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Nova_Lite-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock/)
  [![DynamoDB](https://img.shields.io/badge/DynamoDB-Serverless-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
  [![LangGraph.js](https://img.shields.io/badge/LangGraph.js-Orchestration-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraphjs/)
</div>

---

<br />

> 📸 **Dashboard Overview:** Executive Summary with live metrics.
> ![Dashboard Overview](docs/screenshots/overview.png)

## Table of Contents

- [The Problem — Why This Exists](#the-problem--why-this-exists)
- [What CostIntel Does — Solution Overview](#what-costintel-does--solution-overview)
- [Key Features — Full Feature List](#key-features--full-feature-list)
- [Architecture — Full System Architecture](#architecture--full-system-architecture)
- [The 7-Agent Pipeline — Deep Dive](#the-7-agent-pipeline--deep-dive)
- [Data Flow Diagram (DFD)](#data-flow-diagram-dfd)
- [Tech Stack — Full Table](#tech-stack--full-table)
- [Project File Structure](#project-file-structure)
- [Simulation Scenarios](#simulation-scenarios)
- [AWS Infrastructure](#aws-infrastructure)
- [The Prototype vs. Full Production System](#the-prototype-vs-full-production-system)
- [The Financial Impact Model](#the-financial-impact-model)
- [Setup & Installation](#setup--installation)
- [Environment Variables Reference](#environment-variables-reference)
- [Dashboard Pages](#dashboard-pages)
- [API Reference](#api-reference)
- [How to Add a New Scenario](#how-to-add-a-new-scenario)
- [Judging Criteria Alignment](#judging-criteria-alignment)
- [Contributing & License](#contributing--license)
- [Acknowledgements](#acknowledgements)

---

## The Problem — Why This Exists

Imagine you are the CFO of an Indian enterprise processing `₹500 Crore` in annual procurement spend. Your finance team reviews invoices manually — thousands of them every month. They check for duplicate charges, compare vendor billing against contract rates, and flag anything suspicious. On a good day, they catch about 60% of the anomalies. But here is the problem: **by the time a human analyst spots a duplicate payment or an off-contract charge, the money has already left your account — typically 2 to 4 weeks ago.** 

The leakage is silent, continuous, and compounding.

Industry data shows that Indian enterprises lose between **5% to 8%** of their annual procurement spend to undetected cost leakage. This includes duplicate invoice submissions, off-contract billing, idle cloud infrastructure, and maverick spending. On a `₹500 Crore` budget, 5% leakage translates to **₹25 Crore per year walking out silently**.

Additionally, SLA breaches carry automatic penalty clauses — typically `₹25,000 to ₹1,00,000` per incident. Most SLA breaches are entirely predictable based on ticket volume, capacity, and vendor history. Yet no team prevents them proactively because there is no tool that combines real-time ticket analysis with predictive statistical modelling.

> **The Critical Gap:** No existing tool combines anomaly detection + SLA breach prediction + autonomous corrective action + full audit trail in a single unified pipeline. CostIntel unifies these capabilities into an AI-orchestrated system that runs continuously, acts autonomously on low-risk issues, and holds high-impact decisions for human review.

---

## What Cost Intel Intelligence Does — Solution Overview

Cost Intel Intelligence is an autonomous AI agent system. It is not just a dashboard showing charts; it is an active participant in your enterprise finance operations that detects problems, reasons about causes, takes corrective action, and writes a complete audit trail in under **3 seconds** per execution cycle.

1. **Ingests Data:** Continuously reads procurement invoices and SLA tickets from a DynamoDB stream (mocking a live ERP feed like SAP or Oracle).
2. **Detects Anomalies:** Scans 100% of transactions through a statistical isolation algorithm to identify pricing outliers, duplicates, and off-contract billing.
3. **Predicts Breaches:** Forecasts which SLA tickets will breach their deadline before it happens using capacity and volume metrics.
4. **Reasons & Synthesizes:** Passes findings to Amazon Bedrock's Nova Lite LLM, which synthesizes the raw data into a structured action plan.
5. **Executes Autonomously:** Executes routine P3 actions (vendor blocks, payment holds) instantly.
6. **Requires Human Approval:** Routes critical P1 and P2 actions to a human-in-the-loop approval queue.
7. **Maintains Compliance:** Logs every single decision to an immutable DynamoDB audit trail.

> 📸 **Live Activity Feed:** Dynamic timeline showing agent events in real-time.
> ![Live Activity Feed](docs/screenshots/activity_feed.png)

---

## Key Features — Full Feature List

### 1. 7-Agent LangGraph.js Pipeline
The core of Cost Intel Intelligence is a stateful multi-agent pipeline: `Ingest → Anomaly → SLA → RootCause → Decision → Action → Audit`. Each agent has a single, testable responsibility. LangGraph.js manages a persistent, typed state object that flows through every node, giving the final Audit agent full visibility into what every upstream agent decided and why.

### 2. Dynamic Simulation Engine
Ships with 6 named enterprise scenarios (`normal`, `vendor_spike`, `sla_crisis`, `audit_crunch`, `post_merger`, `festive_rush`). Scenarios control anomaly rates, spike multipliers, and team capacity. The simulator uses zero fixed seeds and has a 20% burst event probability — mimicking real-world clusters of anomalies like compromised vendor accounts. 

> 📸 **Simulation Lab:** Real-time pipeline execution and logging.
> ![Simulation Lab](docs/screenshots/simulation.png)

### 3. Amazon Bedrock Reasoning (Nova Lite + Mistral Fallback)
The Decision Agent uses `amazon.nova-pro-v1:0` via the Bedrock Converse API to synthesize ML findings into a structured JSON action plan. If Nova Lite fails (timeout, rate limit), the pipeline automatically falls back to `mistral.mistral-large-2402-v1:0` using the `[INST]` prompt format. **The pipeline never halts.**

### 4. Statistical Anomaly Detection
Uses statistical methods inspired by Isolation Forest principles. Detects three types of anomalies: `spike`, `off-contract`, and `duplicate_timing`. Each anomaly receives a dynamic severity score and an estimated INR leakage value.

### 5. SLA Breach Prediction
Performs statistical breach prediction combining metrics like team capacity, current ticket volume, time-of-day, and ticket priority. Calculates a breach probability for every open ticket, shifting from a reactive "pay the penalty" model to a proactive "reassign to prevent penalty" stance.

### 6. Human-in-the-Loop (HITL) Workflow
Implements a three-tier priority system:
* **P1:** Critical (over ₹5L) — Immediate human review.
* **P2:** Significant (₹1L–₹5L) — Human review within 24h.
* **P3:** Routine (under ₹1L) — Auto-executes instantly.

> 📸 **AI Actions Page:** Pending P1 approvals and executed actions.
> ![AI Actions Page](docs/screenshots/approvals.png)

### 7. Immutable Audit Trail
Every pipeline run and agent decision is written to the `costintel-audit-log` DynamoDB table containing the `run_id`, agent name, full JSON payload, and timestamps. This satisfies enterprise compliance and regulatory examinations.

> 📸 **Technical Audit Trail:** Expandable traces for every pipeline run.
> ![Audit Trail](docs/screenshots/audit_trail.png)

### 8. Serverless AWS Infrastructure
Fully serverless AWS stack optimized for **AWS Amplify**. 
* **Compute**: Next.js 14 Serverless Functions
* **Storage**: Amazon S3 (Report Persistence)
* **Database**: Amazon DynamoDB (Audit & Actions)
* **Intelligence**: Amazon Bedrock (Nova Lite + Mistral)
* **Security**: IAM Role-based authentication (No hardcoded keys in cloud)

---

## 🧠 1. Core System Architecture

The **Cost Intel Intelligence** platform is designed as a highly cohesive, concurrently executing web application. By fundamentally decoupling the UI presentation layer from the deep AI-orchestration layer, the platform guarantees that intense machine-learning workloads never block or degrade the user experience.

### Architectural Tiers

1.  **Presentation & API Layer (Next.js 14 App Router):**
    Handles static asset delivery, server-side dynamic rendering (`React Server Components`), and exposes lightweight asynchronous API endpoints (`/api/runs`, `/api/approve`). This layer is styled heavily with `Vanilla CSS` and `Framer Motion` for high-fidelity interactive elements, seamlessly providing a polished interface for human oversight.
2.  **Stateful Persistence Layer (Amazon DynamoDB & S3):**
    The system requires ultra-low latency for agent state tracking and high durability for final reports. 
    * **DynamoDB**: Managed via `live-stream`, `approvals`, and `audit-log` tables for structured state.
    * **Amazon S3**: Acts as the long-term vault for full-fidelity JSON reports generated after every pipeline run.
3.  **Intelligence Layer (AWS Bedrock Foundation Models):**
    All cognitive processing routes through an abstraction layer to AWS Bedrock. For reasoning tasks, the system deploys **Amazon Nova Lite** (primary) and **Mistral Large** (fallback). Access is secured via IAM Service Roles, eliminating the need for environment-variable based credentials in production.

```mermaid
flowchart TB

%% ── STYLES ─────────────────────────
classDef main fill:#0f172a,stroke:#3b82f6,color:#f8fafc,stroke-width:2px
classDef core fill:#1e3a8a,stroke:#60a5fa,color:#eff6ff,stroke-width:2px
classDef infra fill:#064e3b,stroke:#10b981,color:#ecfdf5,stroke-width:2px
classDef aux fill:#292524,stroke:#f59e0b,color:#fef3c7,stroke-width:2px
classDef hitl fill:#7c2d12,stroke:#fb923c,color:#fff7ed,stroke-width:2px

%% ── TOP LAYER ──────────────────────
User["👤 User"]:::main

subgraph App["🖥️ Application Layer"]
    direction LR
    UI["Dashboard (Insights, Actions, Audit)"]
    API["API Routes (Trigger, Status, Approvals)"]
end
class App main

%% ── CORE SYSTEM ────────────────────
subgraph Core["🧠 AI System"]
    direction TB
    A1["Data Ingestion"]
    A2["Anomaly Detection"]
    A3["Risk / SLA Prediction"]
    A4["Root Cause Analysis"]
    A5["Decision Engine (LLM)"]
    A6["Action Executor"]
    A7["Audit Logger"]
end
class Core core

%% ── INFRASTRUCTURE ─────────────────
subgraph Infra["☁️ Infrastructure"]
    direction LR
    DB["🗄️ Data Store (Live + Audit)"]
    LLM["🤖 LLM (Bedrock)"]
    SIM["🎲 Simulation / Data Source"]
end
class Infra infra

%% ── HUMAN LOOP ─────────────────────
subgraph HITL["👤 Human-in-the-Loop"]
    direction TB
    H1["Approval Queue"]
    H2["Approve / Reject"]
end
class HITL hitl

%% ── FLOW ───────────────────────────
User --> UI --> API --> A1

A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7

%% infra connections
A1 --> DB
A6 --> DB
A7 --> DB
A5 --> LLM
SIM --> DB

%% HITL loop
A6 -->|High-risk actions| H1
H1 --> H2 --> A6
```


---

## The 7-Agent Pipeline — Deep Dive

Each agent in the Cost Intel Intelligence pipeline is a pure function that updates a shared LangGraph state block. By breaking down the analysis process into 7 distinct cognitive steps, the system achieves perfect determinism: if the LLM makes a mistake, the exact input and reasoning state is captured in the isolated node block for review.

| Agent | Responsibility | Input | Output | Failure Mode |
|---|---|---|---|---|
| **INGEST** | Reads live window from DynamoDB stream table | `window_minutes` config | Raw invoices + tickets arrays | Falls back to last successful window |
| **ANOMALY** | Runs statistical detection across all invoices | Raw invoices | Anomaly findings + severity factors | Rule-based fallback (3× vendor average) |
| **SLA** | Predicts breach probability for open tickets | Raw tickets | Breach risk list + penalty amounts | Rule-based fallback (capacity × volume threshold) |
| **ROOT_CAUSE** | Classifies anomalies | Anomaly findings | Classified findings (spike/off-contract) | Uses top severity factor |
| **DECISION** | Synthesizes action plan via Amazon Nova Lite | All findings | JSON action plan (P1/P2/P3) | **Mistral Large Fallback** |
| **ACTION** | Routes P3 to auto-execute, P1/P2 to DB | Action plan | Executed actions + pending queue | Logs failure, continues pipeline |
| **AUDIT** | Writes complete immutable event record | Full run state | Immutable audit entry | Retries 3× before failure |

---

## ⚙️ LangGraph Autonomous State Machine Flow

While the System Architecture dictates the *infrastructure*, the **LangGraph Orchestration Flow** controls the *cognitive logic*. 

The orchestration pipeline is not a linear script; it is a cyclic, state-driven Graph built on `LangGraph.js`. The state machine marshals an immutable context object (containing `syntheticData`, `anomalies`, `actions`, and `approvals`) across seven discrete nodes.

### How State is Compiled and Passed
1.  **Node Execution:** An agent (e.g., the `AnomalyDetector`) receives the current state, executes its LLM chain bound to a specific prompt template, and appends its findings (like Z-score identified leakage points) back to the state object.
2.  **Conditional Routing:** Edges between nodes dictate logic. For example, if the `DecisionEngine` determines an action is a `P1` (critical threshold) requiring human oversight, the graph conditionally routes to the `SLA/Approval` node instead of immediately executing.
3.  **State Preservation:** The final payload represents a deterministic ledger of the complete run, tracking exactly which model provided which rationalization.

> 📸 **Trace Telemetry:** Expanding the raw JSON payload of a single autonomous graph transition.
> ![Audit Trace Payload](docs/screenshots/audit_trace_detail.png)

```mermaid
flowchart TB
    %% Definitions
    classDef startEnd fill:#000,stroke:#333,stroke-width:4px,color:#fff
    classDef agent fill:#1d4ed8,stroke:#93c5fd,stroke-width:2px,color:#fff,rx:10,ry:10
    classDef llm fill:#b45309,stroke:#fde68a,stroke-width:2px,color:#fff,rx:5,ry:5
    classDef action fill:#047857,stroke:#a7f3d0,stroke-width:2px,color:#fff
    classDef human fill:#be185d,stroke:#fbcfe8,stroke-width:2px,color:#fff
    
    Start((Trigger)) --> Ingest
    
    subgraph Data Processing
        Ingest[🔍 1. Ingest Agent<br/><small>Reads 30m rolling window</small>]
        Anomaly[🧮 2. Anomaly Agent<br/><small>Isolation algorithms</small>]
        SLA[⏳ 3. SLA Agent<br/><small>Statistical breach prediction</small>]
        RC[🧠 4. Root Cause Agent<br/><small>Groups & contextualizes</small>]
        
        Ingest ==> Anomaly ==> SLA ==> RC
    end
    
    subgraph Cognitive Layer
        Decide{⚖️ 5. Decision Agent<br/><small>Synthesizes Action Plan</small>}
        Nova[Amazon Nova Lite<br/><small>Primary Logic Engine</small>]
        Mistral[Mistral Large<br/><small>Failover Logic Engine</small>]
        
        RC ==> Decide
        Decide -.->|Primary Call| Nova
        Decide -.->|Fallback Call| Mistral
    end
    
    subgraph Execution & Routing
        Route[🚦 6. Action Agent<br/><small>Priority Router</small>]
        Auto((⚙️ Auto-Execute<br/>Priority 3))
        HITL((👤 Human-in-Loop<br/>Priority 1 & 2))
        
        Decide ==> Route
        Route -->|Low Risk Mitigation| Auto
        Route -->|High Risk Strategic| HITL
    end
    
    subgraph Security & Compliance
        Audit[🔐 7. Audit Agent<br/><small>Immutable ledger write</small>]
        Auto ==> Audit
        HITL ==> Audit
    end
    
    Audit --> Finish((End))
    
    class Start,Finish startEnd
    class Ingest,Anomaly,SLA,RC,Decide,Route,Audit agent
    class Nova,Mistral llm
    class Auto action
    class HITL human
```

---

## Data Flow Diagram (DFD)

```mermaid
flowchart LR
    subgraph External["External Sources"]
        ERP[Enterprise ERP<br/>simulated]
    end
    
    subgraph Storage1["Data Lake (DynamoDB)"]
        Stream[(live-stream<br/>table)]
    end
    
    subgraph Process["AI Processing Pipeline"]
        AD[Anomaly Detection<br/>Model]
        SLA[SLA Breach<br/>Predictor]
        LLM[Bedrock LLM<br/>Nova Lite]
    end
    
    subgraph Execution["Execution Routing"]
        P3[P3: Auto-execute]
        P12[P1/P2: HITL Queue]
    end
    
    subgraph Storage2["Permanent Storage"]
        App[(approvals<br/>table)]
        Aud[(audit-log<br/>table)]
    end
    
    subgraph UI["Presentation"]
        Dash[Next.js 14<br/>Dashboard]
    end
    
    ERP -->|Injects Invoices & Tickets| Stream
    Stream -->|30-min rolling window| AD
    AD --> SLA
    SLA --> LLM
    LLM -->|Structured Action Plan| Execution
    P3 --> Aud
    P12 --> App
    App -->|Approved| Aud
    Aud --> Dash
    App --> Dash
```

---

## Tech Stack — Full Table

| Layer | Technology | Version | Why This Choice |
|---|---|---|---|
| Frontend Framework | Next.js | 14.2.15 | App Router, Server Components, API routes in one repo |
| Language | TypeScript | 5.x | Type safety across agents, state, and AWS SDK calls |
| UI Components | React | 18.3 | Concurrent rendering for live feed updates |
| Animations | Framer Motion | 11.11 | Smooth metric transitions during live pipeline runs |
| Charts | Recharts | 2.13 | Financial waterfall and time-series charts |
| Styling | Tailwind CSS | 3.4 | Utility-first, dark theme, rapid iteration |
| Agent Orchestration | LangGraph.js | 0.2.19 | Stateful multi-agent graphs with conditional routing |
| LLM Reasoning | Amazon Bedrock Nova Lite | v1:0 | Optimized for speed and cost while maintaining high reasoning capabilities |
| LLM Fallback | Amazon Bedrock Mistral Large | 2402-v1:0 | Automatic failover — pipeline never stops |
| Storage | Amazon S3 | SDK v3 | Persistent storage for immutable JSON audit reports |
| Database | AWS DynamoDB | SDK v3 | Serverless, pay-per-request, TTL for auto-cleanup |
| Mock Data | @faker-js/faker | 9.2 | Realistic Indian enterprise names and patterns |
| Localisation | Intl.NumberFormat | ES | `en-IN` formatting (`formatINR`) for Rupee displays |

---

## Project File Structure

```text
Cost-Intel-Intelligence/
├── src/                              # Main application source code
│   ├── app/                          # Next.js 14 App Router routes
│   │   ├── layout.tsx                # Root layout / GlobalNav wrapper
│   │   ├── page.tsx                  # / — Full Overview dashboard
│   │   ├── simulation/page.tsx       # /simulation — Sim Lab pipeline trigger
│   │   ├── actions/page.tsx          # /actions — Execution & HITL actions
│   │   ├── anomalies/page.tsx        # /anomalies — Risks & Analysis feed
│   │   ├── sla/page.tsx              # /sla — Impact / Working Capital page
│   │   ├── audit/page.tsx            # /audit — Technical trace logging
│   │   └── api/                      # Next.js specific serverless API routes
│   │       ├── pipeline/route.ts     # Triggers AI simulation + LangGraph agents
│   │       ├── approve/route.ts      # HITL approval mechanics
│   │       ├── runs/route.ts         # Pipeline execution history
│   │       ├── metrics/[id]/route.ts # Mathematical KPIs
│   │       ├── audit/[id]/route.ts   # Deep trace retrieval
│   │       └── status/route.ts       # Live system polling
│   │
│   ├── components/                   # React UI presentational components
│   │   └── GlobalNav.tsx             # Navbar with gradient branding
│   │
│   ├── ai_agents/                    # LangGraph.js pipeline logic
│   │   ├── orchestrator.ts           # Wires the graph and conditional routing
│   │   ├── state.ts                  # Shared pipeline state schema
│   │   └── nodes.ts                  # Logic for all 7 independent agents
│   │
│   ├── synthetic_data_engine/
│   │   └── simulator.ts              # 6-scenario engine driving data streams
│   │
│   ├── aws/                          # AWS integrations
│   │   ├── config.ts                 # Resource configurations
│   │   ├── dynamo.ts                 # Database wrappers
│   │   ├── bedrock.ts                # Dual-model LLM abstraction
│   │   └── deploy/
│   │       └── create_tables.ts      # Instantiates DynamoDB tables
│   │
│   └── lib/                          # App utilities
│       └── formatINR.ts              # Financial presentation logic
│
├── docs/screenshots/                 # README demonstration imagery
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js routing and build config
├── package.json                      # NPM dependencies and scripts
├── tailwind.config.js                # Tailwind CSS styling and theme
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## Simulation Scenarios

The active scenario is chosen purely dynamically per run to stress-test the pipeline under different enterprise stressors. 

| Scenario | Description | Anomaly Rate | Breach Rate | Team Capacity | Spike Multiplier |
|---|---|---|---|---|---|
| `normal` | Routine week, low risk. Validates baseline operations. | 4% | 20% | 80% | 3–6× |
| `vendor_spike` | IT and SaaS vendors overbilling. Tests cloud cost surges. | 12% | 28% | 75% | 5–15× |
| `sla_crisis` | Monday morning ticket surge understaffing test. | 3% | 55% | 45% | 2–5× |
| `audit_crunch` | Month-end bulk duplicate resubmissions test. | 9% | 35% | 70% | 2–4× |
| `post_merger` | Integration chaos. Unmapped vendor contract testing. | 15% | 42% | 60% | 4–10× |
| `festive_rush` | Bulk sequence masking legitimate anomalies. High volume. | 7% | 48% | 55% | 6–20× |

> 📸 **Anomalies Detection Module:** Intelligent risk tracking mapped to scenario inputs.
> ![Anomaly Detection](docs/screenshots/anomalies.png)

---

## AWS Infrastructure

### DynamoDB Tables
1. `costintel-live-stream` — **TTL: 24h**. Rolling window of simulated ERP invoices and tickets.
2. `costintel-audit-log` — **TTL: None**. Permanent immutable system event tracing ledger.
3. `costintel-approvals` — **TTL: 48h**. Temporary persistence for pending & reviewed HITL decisions.

### Bedrock Calling Strategy
The `Bedrock Converse API` is utilized natively for Nova Lite to take advantage of its excellent structural adherence and reasoning logic. If restricted or timed out, the `InvokeModel API` intercepts the traffic via a generic text-generation prompt designed specifically to wrap structural constraints onto Mistral Large models, keeping the pipeline unbroken.

---

## 🔮 The Full-Scale Production Vision: Where This Is Going

While the current Cost Intel Intelligence platform serves as a high-fidelity prototype using synthesized data streams, the architecture was explicitly built to seamlessly transition into a **live, multi-cloud enterprise operational environment**. 

Here is exactly how the system maps from its current state to a fully-scaled enterprise deployment:

### 1. Data Ingestion: From Simulation to Live ERP Polling
* **Current:** A synthetic engine generates stochastic financial anomalies and SLA capacity crunches.
* **Production Scale:** The `Ingest Agent` will connect directly to enterprise systems of record.
  * **Finance Data:** Direct REST/SOAP API integration with **SAP S/4HANA**, **Oracle NetSuite**, or **Coupa** to ingest purchase orders, invoice receipts, and vendor contracts in real time.
  * **Operations Data:** Webhooks securely tied to **ServiceNow**, **Jira Service Management**, or **Zendesk** to monitor ticket SLA lifecycles and human agent capacities.
  * **Data Lake Infrastructure:** All raw operational telemetry will route through an Amazon Kinesis Data Stream into a central S3 Data Lake before hitting the LangGraph pipeline.

### 2. Threat Detection: From Heuristics to Deep Learning

> 📸 **Risk Assessment UI:** Identifying Off-Contract and Duplicate leakage events in real-time.
> ![Risk Assessment Matrix](docs/screenshots/risk_matrix_v2.png)

* **Current:** We utilize an optimized Isolation Forest-inspired statistical standard deviation matrix.
* **Production Scale:** 
  * Enterprise anomalies operate in high dimensions. We will deploy clustered **XGBoost ensembles** and **Autoencoders** continuously trained via AWS SageMaker on the corporation's historical spend data.
  * The production models will dynamically track complex patterns: multi-year vendor price-creep, shadow IT unapproved software subscriptions, and fractional duplicate billing spanning across multiple business units and geographic currencies.

### 3. Execution & Corrective Action: Seamless Enterprise Intervention
* **Current:** Actions are routed to a simulated execution queue on the Dashboard Actions Page.
* **Production Scale:** The `Action Agent` gains secure Write-access via highly restricted IAM roles to intervene *before* cash leaves the business.
  * **Automated Intervention (P3):** Instantly hits the SAP API to place a "Payment Hold" flag on a confirmed duplicate invoice before the nightly treasury payment run clears.
  * **Human Approvals (P1/P2):** Integrates directly into workflows via **Slack** or **Microsoft Teams**. The CFO receives an interactive Slack card showing the anomaly, the Amazon Nova Lite structural reasoning, and a one-click `[Approve Hold]` or `[Override]` button. 

### 4. Security, Compliance, & Infrastructure Scaling
* **Role-Based Access Control (RBAC):** Implementation of strict JWT/OAuth2 flows via AWS Cognito. Vendor management teams can only review P2 actions strictly related to their specific vendor portfolio.
* **SOC-2 Immutable Ledgers:** The current DynamoDB audit log will be fortified using **Amazon QLDB (Quantum Ledger Database)**, ensuring that every LLM decision is cryptographically signed, tamper-proof, and instantly verifiable by external financial auditors.
* **Multi-AZ Kubernetes Scaling:** The Next.js dashboard and LangGraph pipelines will be containerized via Docker and orchestrated on Amazon EKS (Elastic Kubernetes Service), allowing the system to auto-scale from 100 invoices/day to 10,000,000 invoices/day seamlessly during corporate month-end financial closes.

---

## The Financial Impact Model

We model our impact projection using conservative figures tied to a fictional but completely standard mid-cap Indian corporation.

```text
================================================================
IMPACT CALCULATION FOR A ₹500 CRORE PROCUREMENT BUDGET
================================================================

Assumption 1: Industry Leakage
  ₹500 Cr × 5% = ₹25 Crore estimated cost leakage annually

Assumption 2: CostIntel Recovery Rate
  ₹25 Cr × 85% conservative mitigation = ₹21.25 Crore

Assumption 3: SLA Penalty Protections
  1,000 tickets/month × 8% breach probability × ₹50,000 avg penalty
  = ₹40 Lakh/month = ₹4.8 Cr/year penalty risk
  Cost Intel Intelligence proactive intervention at 70% success = ₹3.36 Crore savings

TOTAL ANNUAL ENTERPRISE VALUE DELIVERED: ₹24.61 Crore Return
================================================================
```

> 📸 **Working Capital Protected:** Real-time demonstration of value creation.
> ![Financial Impact Engine](docs/screenshots/impact.png)

---

---

## 🚀 AWS Amplify Deployment Guide

Cost Intel Intelligence is optimized for a zero-trust, serverless deployment on **AWS Amplify**.

### 1. Repository Connection
Connect your GitHub repository to the **AWS Amplify Console**. Amplify will automatically detect the Next.js 14 settings and configure the build settings.

### 2. IAM Service Role (CRITICAL)
Since the application runs serverless, it uses an **IAM Service Role** instead of static access keys for maximum security.
1. Create an IAM Role with `AmazonS3FullAccess`, `AmazonDynamoDBFullAccess`, and `AmazonBedrockFullAccess`.
2. Assign this role as the **Service Role** in your Amplify App settings.

### 3. Environment Variables
Configure the following non-reserved variables in the Amplify Console:
* `REGION`: `us-east-1` (or your preferred Bedrock region)
* `APP_MODE`: `cloud`
* `S3_BUCKET`: `costintel-data-prod`
* `DYNAMO_STREAM_TABLE`: `costintel-live-stream`
* `DYNAMO_AUDIT_TABLE`: `costintel-audit-log`
* `DYNAMO_APPROVAL_TABLE`: `costintel-approvals`

### 4. Build & Deploy
Once pushed, Amplify will build the NextJS application, instantiate the serverless functions, and map the environment variables. The application will be live at your `.amplifyapp.com` domain.

---

## Setup & Installation (Local Development)

```bash
# 1. Clone & Install
git clone https://github.com/adarshcod30/Cost-Intel-Intelligence.git
cd Cost-Intel-Intelligence
npm install

# 2. Configure Local Environment
cp .env.example .env
# Edit .env and supply your local AWS credentials

# 3. Provision AWS Tables
# This script must be run once to instantiate the DynamoDB tables in your region
npx ts-node src/aws/deploy/create_tables.ts

# 4. Deploy to AWS Amplify
# 1. Connect this repo to the AWS Amplify Console.
# 2. Set the Environment Variables listed below.
# 3. Attach an IAM Role to the Amplify App with Bedrock/DynamoDB/S3 permissions.
# 4. Trigger build.
```

---

## Environment Variables Reference

| Variable | Requirement | Description |
|---|---|---|
| `REGION` | **Required** | Target AWS Region (e.g., `us-east-1`) |
| `APP_MODE` | **Required** | Set to `cloud` for Amplify or `local` for dev |
| `S3_BUCKET` | **Required** | The S3 bucket name for report storage |
| `DYNAMO_STREAM_TABLE` | **Required** | The DynamoDB table for live data |
| `DYNAMO_AUDIT_TABLE` | **Required** | The DynamoDB table for audit logs |
| `DYNAMO_APPROVAL_TABLE` | **Required** | The DynamoDB table for approvals |
| `BEDROCK_PRIMARY_MODEL` | Optional | Default: `amazon.nova-lite-v1:0` |
| `AWS_ACCESS_KEY_ID` | *Local Only* | Not used in `cloud` mode (IAM Role preferred) |
| `AWS_SECRET_ACCESS_KEY` | *Local Only* | Not used in `cloud` mode (IAM Role preferred) |

---

## Dashboards & APIs

### Key Page Routes
- `/`: The cinematic narrative overview.
- `/simulation`: Execution lab to manually trace agent activities and stream statuses.
- `/actions`: Prioritization routing desk. Houses the interactive HITL (Human-in-the-Loop) interfaces for P1/P2 approvals.
- `/anomalies`: Detection feed listing items mapped accurately back to standard operational processes.
- `/sla`: Enterprise value tracking engine calculating running returns on the infrastructure deployment.
- `/audit`: Security-led technical tracing ledger pulling immutable histories from DynamoDB.

### Full API Reference

| Endpoint | Method | Input Parameters | Return Scope |
|---|---|---|---|
| `/api/pipeline` | POST | None | Dispatches Simulation & 7-Agent Invocation |
| `/api/approve` | GET | None | Reads & enumerates uncompleted P1/P2 actions |
| `/api/approve` | POST | `action_id`, `run_id`, `decision` | Commits approval back to DynamoDB records |
| `/api/runs` | GET | None | Reads historical array of agent deployments |
| `/api/metrics/[id]` | GET | `id: string` | Aggregates mathematical impact per sequence |
| `/api/audit/[id]` | GET | `id: string` | Exposes serialized states per step within run |
| `/api/status` | GET | None | Serves live operational and polling metrics |

---

## How to Add a New Scenario

Extend testing coverage via the simulation engine effortlessly:

```typescript
// Open src/synthetic_data_engine/simulator.ts
export const SCENARIOS = {
  // Add an custom behavior profile context
  fiscal_year_close: {
    anomalyRate:     0.18,   // High pressure risk spikes
    spikeMultiplier: [2, 7], // Moderate rate inflation 
    breachRate:      0.22,   // Stabilized service impacts
    teamCapacity:    0.95,   // Elevated manpower deployment
    ticketVolume:    45,     // Extreme operations volume
  },
};
```
The architecture natively folds this context into detection baselines without additional scaling work.

---

## Contributing & License

We love to collaborate on extending this framework further. Contributions standard via fork & pull request branches alongside accompanying testing.

### MIT License
This software is provided "AS IS", completely open-sourced to encourage iterative optimization against the complex nature of cost leakages. 

---

## Acknowledgements

* **Developed by Adarsh Dwivedi**
  * 📱 +91 9305597756
  * 💻 [GitHub Profile](https://github.com/adarshcod30)
  * 🔗 [LinkedIn Profile](https://www.linkedin.com/in/adarshdwivedi30)
  * *Adarsh is a passionate software engineer specializing in AI-driven enterprise applications and full-stack development. By integrating sophisticated large language models with reliable backend architectures, he focuses on building scalable autonomous systems that solve real-world problems.*
* **AWS Bedrock** for unlocking advanced programmatic reasoning mechanics at minimal latencies.
* **LangChain** for `LangGraph.js` making stateful routing structurally sustainable.

<br />
<div align="center">
  <b>Architected by Adarsh Dwivedi — Cost Intel Intelligence</b>
</div>
