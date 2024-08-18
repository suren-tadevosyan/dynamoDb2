import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const { DynamoDB } = AWS;
const dynamoDb = new DynamoDB.DocumentClient();
const AUDIT_TABLE = process.env.target_table || "Audit";

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newItem = record.dynamodb.NewImage;
      const auditItem = {
        id: uuidv4(),
        itemKey: newItem.key.S,
        modificationTime: new Date().toISOString(),
        newValue: {
          key: newItem.key.S,
          value: newItem.value.N,
        },
      };

      await dynamoDb
        .put({
          TableName: AUDIT_TABLE,
          Item: auditItem,
        })
        .promise();
    } else if (record.eventName === "MODIFY") {
      const oldItem = record.dynamodb.OldImage;
      const newItem = record.dynamodb.NewImage;
      const auditItem = {
        id: uuidv4(),
        itemKey: newItem.key.S,
        modificationTime: new Date().toISOString(),
        updatedAttribute: "value",
        oldValue: oldItem.value.N,
        newValue: newItem.value.N,
      };

      await dynamoDb
        .put({
          TableName: AUDIT_TABLE,
          Item: auditItem,
        })
        .promise();
    }
  }

  return { statusCode: 200, body: "Success" };
};
