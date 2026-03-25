import { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand 
} from "@aws-sdk/client-dynamodb";
import { config } from "../config";

const client = new DynamoDBClient({
  region: config.region,
  credentials: config.credentials,
  ...(config.isLocal ? { endpoint: "http://localhost:8000" } : {})
});

async function createTableIfNotExists(tableName: string, schema: any) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Table ${tableName} already exists.`);
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      console.log(`🚀 Creating table ${tableName}...`);
      await client.send(new CreateTableCommand({
        TableName: tableName,
        ...schema,
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }));
      console.log(`✨ Table ${tableName} created successfully.`);
    } else {
      throw error;
    }
  }
}

async function provision() {
  console.log(`🛠️ Provisioning DynamoDB in ${config.isLocal ? "LOCAL" : "CLOUD"} mode...`);
  
  // 1. Live Stream Table
  await createTableIfNotExists(config.tables.stream, {
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ]
  });

  // 2. Audit Log Table
  await createTableIfNotExists(config.tables.audit, {
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ]
  });

  // 3. Approvals Table
  await createTableIfNotExists(config.tables.approvals, {
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ]
  });

  console.log("🏁 Provisioning complete!");
}

provision().catch(console.error);
