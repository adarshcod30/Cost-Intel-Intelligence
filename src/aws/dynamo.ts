// src/aws/dynamo.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions:   { removeUndefinedValues: true, convertEmptyValues: true },
  unmarshallOptions: { wrapNumbers: false },
})

const STREAM_TABLE   = process.env.DYNAMO_STREAM_TABLE   || 'costintel-live-stream'
const AUDIT_TABLE    = process.env.DYNAMO_AUDIT_TABLE    || 'costintel-audit-log'
const APPROVAL_TABLE = process.env.DYNAMO_APPROVAL_TABLE || 'costintel-approvals'


// ── STREAM TABLE ─────────────────────────────────────────────────────────────

export async function putInvoice(invoice: Record<string, unknown>) {
  await docClient.send(new PutCommand({
    TableName: STREAM_TABLE,
    Item: {
      pk:          `INVOICE#${invoice.invoice_id}`,
      sk:          invoice.created_at || new Date().toISOString(),
      entity_type: 'invoice',
      ttl:         Math.floor(Date.now() / 1000) + 86400, // 24hr TTL
      ...invoice,
    },
  }))
}

export async function putTicket(ticket: Record<string, unknown>) {
  await docClient.send(new PutCommand({
    TableName: STREAM_TABLE,
    Item: {
      pk:          `TICKET#${ticket.ticket_id}`,
      sk:          ticket.created_at || new Date().toISOString(),
      entity_type: 'ticket',
      ttl:         Math.floor(Date.now() / 1000) + 86400,
      ...ticket,
    },
  }))
}

export async function getRecentInvoices(windowMinutes: number = 30) {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
  const result = await docClient.send(new ScanCommand({
    TableName: STREAM_TABLE,
    FilterExpression: 'entity_type = :t AND sk >= :c',
    ExpressionAttributeValues: { ':t': 'invoice', ':c': cutoff },
  }))
  return result.Items || []
}

export async function getRecentTickets(windowMinutes: number = 30) {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
  const result = await docClient.send(new ScanCommand({
    TableName: STREAM_TABLE,
    FilterExpression: 'entity_type = :t AND sk >= :c',
    ExpressionAttributeValues: { ':t': 'ticket', ':c': cutoff },
  }))
  return result.Items || []
}

export async function getStreamStats() {
  const recent = await getRecentInvoices(30)
  return { recent_invoices_30m: recent.length }
}


// ── AUDIT TABLE ───────────────────────────────────────────────────────────────

export async function logEvent(
  runId: string,
  agent: string,
  event: string,
  payload: Record<string, unknown>
) {
  const sk = `${new Date().toISOString()}#${Math.random().toString(36).slice(2, 8)}`
  await docClient.send(new PutCommand({
    TableName: AUDIT_TABLE,
    Item: {
      pk:        `RUN#${runId}`,
      sk,
      run_id:    runId,
      agent,
      event,
      timestamp: new Date().toISOString(),
      payload,
    },
  }))
}

export async function getRunEvents(runId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName:              AUDIT_TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': `RUN#${runId}` },
    ScanIndexForward:       true,
  }))
  return result.Items || []
}

export async function getAllRuns() {
  const result = await docClient.send(new ScanCommand({
    TableName:        AUDIT_TABLE,
    FilterExpression: '#e = :e',
    ExpressionAttributeNames:  { '#e': 'event' },
    ExpressionAttributeValues: { ':e': 'run_started' },
    ProjectionExpression: 'run_id, #ts',
    // Note: need alias for timestamp too since it might be reserved
  }))
  return (result.Items || []).sort(
    (a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')
  )
}


// ── APPROVAL TABLE ────────────────────────────────────────────────────────────

export async function insertPendingActions(
  actions: Array<Record<string, unknown>>,
  runId: string
) {
  for (const action of actions) {
    await docClient.send(new PutCommand({
      TableName: APPROVAL_TABLE,
      Item: {
        pk:                   `ACTION#${action.action_id}`,
        sk:                   runId,
        run_id:               runId,
        status:               'pending',
        created_at:           new Date().toISOString(),
        ttl:                  Math.floor(Date.now() / 1000) + 172800, // 48hr TTL
        ...action,
      },
    }))
  }
}

export async function getPendingActions(runId?: string) {
  const filterExpr = runId
    ? '#s = :s AND run_id = :r'
    : '#s = :s'
  const exprValues: Record<string, unknown> = { ':s': 'pending' }
  if (runId) exprValues[':r'] = runId

  const result = await docClient.send(new ScanCommand({
    TableName:        APPROVAL_TABLE,
    FilterExpression: filterExpr,
    ExpressionAttributeNames:  { '#s': 'status' },
    ExpressionAttributeValues: exprValues,
  }))
  return result.Items || []
}

export async function updateActionStatus(
  actionId: string,
  runId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string = 'dashboard_user'
) {
  await docClient.send(new UpdateCommand({
    TableName: APPROVAL_TABLE,
    Key: { pk: `ACTION#${actionId}`, sk: runId },
    UpdateExpression: 'SET #s = :s, reviewed_at = :ra, reviewed_by = :rb',
    ExpressionAttributeNames:  { '#s': 'status' },
    ExpressionAttributeValues: {
      ':s':  status,
      ':ra': new Date().toISOString(),
      ':rb': reviewedBy,
    },
  }))
}
