import { v4 as uuidv4 } from 'uuid';
import { putInvoice, putTicket } from '../aws_infrastructure/dynamo';
import { faker } from '@faker-js/faker';

const generateVendorPool = () => Array.from({ length: 100 }).map((_, i) => ({
  id: `VND-${i.toString().padStart(4, '0')}`,
  name: faker.company.name(),
  base: faker.number.int({ min: 10000, max: 800000 }),
  category: faker.helpers.arrayElement(['IT', 'SaaS', 'Logistics', 'HR', 'Facilities', 'Cloud', 'Marketing', 'Legal']),
}));

const SCENARIOS = {
  normal:       { anomaly_rate: 0.04, spike_mult: [3, 6],  breach_rate: 0.20, cap: 0.80, vol: 12 },
  vendor_spike: { anomaly_rate: 0.12, spike_mult: [5, 15], breach_rate: 0.28, cap: 0.75, vol: 15 },
  sla_crisis:   { anomaly_rate: 0.03, spike_mult: [2, 5],  breach_rate: 0.55, cap: 0.45, vol: 35 },
};

const generateInvoice = (scenario: any, vendors: any[]) => {
  const vendor = faker.helpers.arrayElement(vendors);
  const base = vendor.base;
  let amount = base * (0.8 + Math.random() * 0.4);
  let atype = 'normal';
  let is_anom = 0;

  const r = Math.random();
  if (r < 0.02) {
    atype = 'duplicate'; is_anom = 1;
  } else if (r < scenario.anomaly_rate) {
    const [lo, hi] = scenario.spike_mult;
    amount = base * (lo + Math.random() * (hi - lo));
    atype = 'spike'; is_anom = 1;
  }

  return {
    invoice_id: `INV-${uuidv4().substring(0, 10).toUpperCase()}`,
    vendor_id: vendor.id,
    vendor_name: vendor.name,
    invoice_amount: amount,
    contract_rate: base * 1.1,
    category: vendor.category,
    anomaly_type: atype,
    is_anomaly: is_anom,
    created_at: new Date().toISOString(),
  };
};

const generateTicket = (scenario: any) => {
  const cap = Math.max(0.2, scenario.cap + (Math.random() - 0.5) * 0.25);
  const vol = Math.max(1, Math.floor(scenario.vol * (0.5 + Math.random())));
  const sla = faker.helpers.arrayElement([4, 8, 24, 48]);
  const breach = Math.random() < scenario.breach_rate ? 1 : 0;
  
  return {
    ticket_id: `TKT-${uuidv4().substring(0, 10).toUpperCase()}`,
    priority: faker.helpers.arrayElement(['P1', 'P2', 'P3', 'P4']),
    sla_deadline_hours: sla,
    ticket_volume_last_24h: vol,
    team_capacity: cap,
    breached: breach,
    penalty_inr: breach * faker.helpers.arrayElement([25000, 50000, 100000]),
    created_at: new Date().toISOString(),
  };
};

export const runSimulation = async () => {
  const scenarioName = faker.helpers.arrayElement(Object.keys(SCENARIOS)) as keyof typeof SCENARIOS;
  const scenario = SCENARIOS[scenarioName];
  const vendors = generateVendorPool();

  const nInvoices = faker.number.int({ min: 4, max: 12 });
  const nTickets = faker.number.int({ min: 2, max: 6 });

  console.log(`[Simulator] Running scenario: ${scenarioName} (${nInvoices} inv, ${nTickets} tkt)`);

  const invPromises = Array.from({ length: nInvoices }).map(() => putInvoice(generateInvoice(scenario, vendors)));
  const tktPromises = Array.from({ length: nTickets }).map(() => putTicket(generateTicket(scenario)));

  await Promise.all([...invPromises, ...tktPromises]);
  return { invoices: nInvoices, tickets: nTickets, scenario: scenarioName };
};

// For Lambda Environment
export const handler = async (event: any) => {
  const result = await runSimulation();
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

if (require.main === module) {
  runSimulation().catch(console.error);
}
