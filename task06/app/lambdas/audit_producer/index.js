const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "MODIFY" || record.eventName === "INSERT") {
      const newItem = record.dynamodb.NewImage;
      const oldItem = record.dynamodb.OldImage;

      const auditEntry = {
        TableName: "Audit",
        Item: {
          id: newItem.id.S,
          changeType: record.eventName,
          newValue: newItem,
          oldValue: oldItem,
          timestamp: new Date().toISOString(),
        },
      };

      await dynamoDb.put(auditEntry).promise();
    }
  }
};
