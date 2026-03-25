// src/synthetic_data_engine/simulator.ts

export const SCENARIOS = {
  normal:         { anomalyRate: 0.04, spikeMultiplier: [3, 6],   breachRate: 0.20, teamCapacity: 0.80, ticketVolume: 12 },
  vendor_spike:   { anomalyRate: 0.12, spikeMultiplier: [5, 15],  breachRate: 0.28, teamCapacity: 0.75, ticketVolume: 15 },
  sla_crisis:     { anomalyRate: 0.03, spikeMultiplier: [2, 5],   breachRate: 0.55, teamCapacity: 0.45, ticketVolume: 35 },
  audit_crunch:   { anomalyRate: 0.09, spikeMultiplier: [2, 4],   breachRate: 0.35, teamCapacity: 0.70, ticketVolume: 20 },
  post_merger:    { anomalyRate: 0.15, spikeMultiplier: [4, 10],  breachRate: 0.42, teamCapacity: 0.60, ticketVolume: 28 },
  festive_rush:   { anomalyRate: 0.07, spikeMultiplier: [6, 20],  breachRate: 0.48, teamCapacity: 0.55, ticketVolume: 40 },
} as const

type ScenarioKey = keyof typeof SCENARIOS

// Rotate scenario by hour so it changes naturally every hour
export function getActiveScenario(): ScenarioKey {
  const keys = Object.keys(SCENARIOS) as ScenarioKey[]
  return keys[new Date().getHours() % keys.length]
}

// Vendor pool generated fresh every simulator call (no seed)
function generateVendorPool(size = 60) {
  const categories = ['IT', 'SaaS', 'Logistics', 'HR', 'Facilities', 'Cloud', 'Marketing']
  return Array.from({ length: size }, (_, i) => ({
    id:       `VND-${String(i).padStart(3, '0')}`,
    name:     `Enterprise Vendor ${i + 1}`,
    base:     Math.exp(10 + (Math.random() - 0.5) * 1.6), // log-normal
    category: categories[Math.floor(Math.random() * categories.length)],
  }))
}

export interface GeneratedInvoice {
  invoice_id:      string
  vendor_id:       string
  vendor_name:     string
  invoice_amount:  number
  contract_rate:   number
  category:        string
  approved_by:     string
  anomaly_type:    'normal' | 'spike' | 'off_contract' | 'duplicate'
  is_anomaly:      number
  created_at:      string
}

export interface GeneratedTicket {
  ticket_id:              string
  priority:               string
  sla_deadline_hours:     number
  ticket_volume_last_24h: number
  team_capacity:          number
  hour_of_day:            number
  day_of_week:            number
  breached:               number
  penalty_inr:            number
  created_at:             string
}

export interface SimulatorOutput {
  invoices:        GeneratedInvoice[]
  tickets:         GeneratedTicket[]
  scenario:        ScenarioKey
  total_leakage:   number
  anomaly_count:   number
  breach_count:    number
  timestamp:       string
}


function randomBetween(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo)
}

function lognormal(mean: number, sigma: number): number {
  // Box-Muller transform for log-normal
  const u1 = Math.random(), u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return Math.exp(mean + sigma * z)
}

function generateInvoice(
  vendor: ReturnType<typeof generateVendorPool>[0],
  scenario: typeof SCENARIOS[ScenarioKey]
): GeneratedInvoice {
  const base   = vendor.base
  let amount   = base * lognormal(0, 0.25)
  let atype: GeneratedInvoice['anomaly_type'] = 'normal'
  let isAnom   = 0

  const roll = Math.random()

  if (roll < 0.02) {
    atype = 'duplicate'
    isAnom = 1
  } else if (roll < 0.05) {
    amount = base * randomBetween(1.25, 2.0)
    atype  = 'off_contract'
    isAnom = 1
  } else if (roll < scenario.anomalyRate) {
    const [lo, hi] = scenario.spikeMultiplier
    amount = base * randomBetween(lo, hi)
    atype  = 'spike'
    isAnom = 1
  }

  const firstNames = ['Rahul','Priya','Amit','Sneha','Vikram','Kavya','Arjun','Divya']
  const lastNames  = ['Sharma','Patel','Kumar','Singh','Mehta','Joshi','Gupta','Rao']
  const approver   = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`

  return {
    invoice_id:     `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    vendor_id:      vendor.id,
    vendor_name:    vendor.name,
    invoice_amount: Math.round(amount * 100) / 100,
    contract_rate:  Math.round(base * 1.1 * 100) / 100,
    category:       vendor.category,
    approved_by:    approver,
    anomaly_type:   atype,
    is_anomaly:     isAnom,
    created_at:     new Date().toISOString(),
  }
}

function generateTicket(
  scenario: typeof SCENARIOS[ScenarioKey]
): GeneratedTicket {
  const cap      = Math.max(0.2, scenario.teamCapacity + (Math.random() - 0.5) * 0.24)
  const vol      = Math.max(1, Math.round(scenario.ticketVolume + (Math.random() - 0.5) * 10))
  const sla      = [4, 8, 24, 48][Math.floor(Math.random() * 4)]
  const priority = Math.random() < 0.05 ? 'P1' : Math.random() < 0.20 ? 'P2' : Math.random() < 0.70 ? 'P3' : 'P4'
  const breach   = Math.random() < scenario.breachRate ? 1 : 0
  const now      = new Date()

  return {
    ticket_id:              `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    priority,
    sla_deadline_hours:     sla,
    ticket_volume_last_24h: vol,
    team_capacity:          Math.round(cap * 1000) / 1000,
    hour_of_day:            now.getHours(),
    day_of_week:            now.getDay(),
    breached:               breach,
    penalty_inr:            breach * [25000, 50000, 100000][Math.floor(Math.random() * 3)],
    created_at:             now.toISOString(),
  }
}


export function runSimulation(
  nInvoices: number = 50,
  nTickets:  number = 15,
  forceScenario?: ScenarioKey,
): SimulatorOutput {
  const scenarioKey = forceScenario || getActiveScenario()
  const scenario    = SCENARIOS[scenarioKey]
  const vendors     = generateVendorPool(60)

  // Inject an anomaly burst 1 in every 5 runs (20% chance)
  const burst = Math.random() < 0.20
  if (burst) {
    nInvoices += Math.floor(randomBetween(4, 9))
    console.log('[Simulator] BURST EVENT — injecting extra anomalies this run')
  }

  const invoices = Array.from({ length: nInvoices }, () =>
    generateInvoice(vendors[Math.floor(Math.random() * vendors.length)], scenario)
  )

  const tickets = Array.from({ length: nTickets }, () =>
    generateTicket(scenario)
  )

  const anomalies  = invoices.filter(i => i.is_anomaly)
  const totalLeakage = anomalies.reduce((sum, i) => {
    return sum + Math.max(0, i.invoice_amount - i.contract_rate)
  }, 0)

  return {
    invoices,
    tickets,
    scenario:      scenarioKey,
    total_leakage: Math.round(totalLeakage * 100) / 100,
    anomaly_count: anomalies.length,
    breach_count:  tickets.filter(t => t.breached).length,
    timestamp:     new Date().toISOString(),
  }
}
