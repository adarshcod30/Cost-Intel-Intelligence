import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  ScanCommand, 
  QueryCommand, 
  UpdateCommand 
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { AWS_CONFIG, DYNAMO_TABLE_NAMES } from './config';

const client = new DynamoDBClient(AWS_CONFIG);
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// Helper to handle rounding for DynamoDB Decimals
const round = (num: number) => parseFloat(num.toFixed(6));

// --- STREAM TABLE (Invoices + Tickets) ---

export const putInvoice = async (row: any) => {
  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 hours

  const command = new PutCommand({
    TableName: DYNAMO_TABLE_NAMES.STREAM,
    Item: {
      pk: `INVOICE#${row.invoice_id}`,
      sk: row.created_at || now,
      entity_type: 'invoice',
      ttl,
      ...row,
      invoice_amount: round(row.invoice_amount),
      contract_rate: round(row.contract_rate),
    },
  });

  await ddbDocClient.send(command);
};

export const putTicket = async (row: any) => {
  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 24 * 3600;

  const command = new PutCommand({
    TableName: DYNAMO_TABLE_NAMES.STREAM,
    Item: {
      pk: `TICKET#${row.ticket_id}`,
      sk: row.created_at || now,
      entity_type: 'ticket',
      ttl,
      ...row,
      team_capacity: round(row.team_capacity),
      penalty_inr: round(row.penalty_inr || 0),
    },
  });

  await ddbDocClient.send(command);
};

export const getRecentInvoices = async (windowMinutes: number = 30) => {
  const cutoff = new Date(Date.now() - windowMinutes * 60000).toISOString();
  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_NAMES.STREAM,
    FilterExpression: 'entity_type = :type AND sk >= :cutoff',
    ExpressionAttributeValues: {
      ':type': 'invoice',
      ':cutoff': cutoff,
    },
  });

  const response = await ddbDocClient.send(command);
  return response.Items || [];
};

export const getRecentTickets = async (windowMinutes: number = 30) => {
  const cutoff = new Date(Date.now() - windowMinutes * 60000).toISOString();
  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_NAMES.STREAM,
    FilterExpression: 'entity_type = :type AND sk >= :cutoff',
    ExpressionAttributeValues: {
      ':type': 'ticket',
      ':cutoff': cutoff,
    },
  });

  const response = await ddbDocClient.send(command);
  return response.Items || [];
};

// --- AUDIT TABLE ---

export const logEvent = async (runId: string, agent: string, event: string, payload: any) => {
  const timestamp = new Date().toISOString();
  const command = new PutCommand({
    TableName: DYNAMO_TABLE_NAMES.AUDIT,
    Item: {
      pk: `RUN#${runId}`,
      sk: `${timestamp}#${uuidv4().substring(0, 6)}`,
      run_id: runId,
      agent,
      event,
      timestamp,
      payload,
    },
  });

  await ddbDocClient.send(command);
};

export const getRunEvents = async (runId: string) => {
  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_NAMES.AUDIT,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `RUN#${runId}`,
    },
    ScanIndexForward: true,
  });

  const response = await ddbDocClient.send(command);
  return response.Items || [];
};

export const getAllRuns = async () => {
  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_NAMES.AUDIT,
    FilterExpression: 'event = :event',
    ExpressionAttributeValues: {
      ':event': 'run_started',
    },
    ProjectionExpression: 'run_id, #ts',
    ExpressionAttributeNames: {
      '#ts': 'timestamp',
    },
  });

  const response = await ddbDocClient.send(command);
  return (response.Items || []).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

// --- APPROVAL TABLE ---

export const insertPendingActions = async (actions: any[], runId: string) => {
  const ttl = Math.floor(Date.now() / 1000) + 48 * 3600; // 48 hours
  const promises = actions.map(a => {
    const command = new PutCommand({
      TableName: DYNAMO_TABLE_NAMES.APPROVALS,
      Item: {
        pk: `ACTION#${a.action_id}`,
        sk: runId,
        ...a,
        run_id: runId,
        status: 'pending',
        created_at: new Date().toISOString(),
        ttl,
        estimated_impact_inr: round(a.estimated_impact_inr),
      },
    });
    return ddbDocClient.send(command);
  });

  await Promise.all(promises);
};

export const getPendingActions = async (runId?: string) => {
  let filter = 'status = :status';
  let values: any = { ':status': 'pending' };

  if (runId) {
    filter += ' AND run_id = :runId';
    values[':runId'] = runId;
  }

  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_NAMES.APPROVALS,
    FilterExpression: filter,
    ExpressionAttributeValues: values,
  });

  const response = await ddbDocClient.send(command);
  return response.Items || [];
};

export const updateActionStatus = async (actionId: string, status: string, reviewedBy: string = 'human') => {
  const scanCommand = new ScanCommand({
    TableName: DYNAMO_TABLE_NAMES.APPROVALS,
    FilterExpression: 'action_id = :aid',
    ExpressionAttributeValues: {
      ':aid': actionId,
    },
  });

  const scanResponse = await ddbDocClient.send(scanCommand);
  if (!scanResponse.Items || scanResponse.Items.length === 0) return false;

  const item = scanResponse.Items[0];
  const updateCommand = new UpdateCommand({
    TableName: DYNAMO_TABLE_NAMES.APPROVALS,
    Key: { pk: item.pk, sk: item.sk },
    UpdateExpression: 'SET #s = :s, reviewed_at = :ra, reviewed_by = :rb',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':s': status,
      ':ra': new Date().toISOString(),
      ':rb': reviewedBy,
    },
  });

  await ddbDocClient.send(updateCommand);
  return true;
};
