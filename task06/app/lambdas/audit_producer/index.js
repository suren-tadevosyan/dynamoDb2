const dynamoDb = new AWS.DynamoDB.DocumentClient();
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "MODIFY" || record.eventName === "INSERT") {
      const newItem = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb.NewImage
      );
      const oldItem = record.dynamodb.OldImage
        ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
        : null;

      const auditEntry = {
        TableName: "Audit",
        Item: {
          id: uuidv4(),
          itemKey: newItem.key || "UnknownKey",
          modificationTime: new Date().toISOString(),
          newValue: newItem,
          oldValue: oldItem,
        },
      };

      await dynamoDb.put(auditEntry).promise();
    }
  }
};
