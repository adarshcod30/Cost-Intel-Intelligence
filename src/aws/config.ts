import dotenv from 'dotenv';
dotenv.config();

export const AWS_CONFIG = {
  region: process.env.REGION || 'us-east-1',
  // In Cloud mode (Amplify), we rely 100% on the IAM role attached to the app.
  // We ONLY provide explicit credentials in local mode or if specifically requested.
  ...(process.env.APP_MODE === 'local' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  } : {}),
};

export const DYNAMO_TABLE_NAMES = {
  STREAM: process.env.DYNAMO_STREAM_TABLE || 'costintel-live-stream',
  AUDIT: process.env.DYNAMO_AUDIT_TABLE || 'costintel-audit-log',
  APPROVALS: process.env.DYNAMO_APPROVAL_TABLE || 'costintel-approvals',
};

export const BEDROCK_MODELS = {
  PRIMARY:  process.env.BEDROCK_PRIMARY_MODEL  || 'amazon.nova-lite-v1:0',
  FALLBACK: process.env.BEDROCK_FALLBACK_MODEL || 'mistral.mistral-large-2402-v1:0',
};

export const S3_BUCKETS = {
  MODELS: process.env.S3_BUCKET_MODELS || 'costintel-models-prod',
  DATA:   process.env.S3_BUCKET        || 'costintel-data-prod',
};

export const PIPELINE_CONFIG = {
  DEFAULT_WINDOW_MINUTES: 30,
  BEDROCK_MAX_TOKENS: 4096,
  BEDROCK_TEMPERATURE: 0.1,
};

export const config = {
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials,
  tables: {
    stream: DYNAMO_TABLE_NAMES.STREAM,
    audit: DYNAMO_TABLE_NAMES.AUDIT,
    approvals: DYNAMO_TABLE_NAMES.APPROVALS,
  },
  isLocal: process.env.APP_MODE === 'local',
};
