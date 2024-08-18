import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    console.log("Event received:", JSON.stringify(event, null, 2));

    if (!event.Records || !Array.isArray(event.Records)) {
      console.error("event.Records is not an array or is undefined");
      return;
    }

    for (const record of event.Records) {
      console.log("Processing record:", JSON.stringify(record, null, 2));

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

        console.log("Audit entry:", JSON.stringify(auditEntry, null, 2));

        await dynamoDb.put(auditEntry).promise();
        console.log("Audit entry inserted successfully");
      }
    }
  } catch (error) {
    console.error("Error processing event:", error);
  }
};
