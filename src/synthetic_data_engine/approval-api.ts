import { updateActionStatus, getPendingActions } from '../aws_infrastructure/dynamo';

export const handler = async (event: any) => {
  const method = event.httpMethod || 'GET';
  const path = event.path || '/';
  const params = event.queryStringParameters || {};
  let body: any = {};
  
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {}
  }

  // CORS Headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // GET /pending
    if (method === 'GET' && path.includes('/pending')) {
      const runId = params.run_id;
      const pending = await getPendingActions(runId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ pending }),
      };
    }

    // POST /approve
    if (method === 'POST' && path.includes('/approve')) {
      const { action_id, status, reviewed_by } = body;
      if (!action_id || !status) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing action_id or status' }),
        };
      }

      await updateActionStatus(action_id, status, reviewed_by || 'api_user');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, action_id, status }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
