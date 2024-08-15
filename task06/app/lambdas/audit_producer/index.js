const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
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
