const Disposition = process.env.Disposition;
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
const AWS_REGION = process.env.AWS_REGION;

const client = new DynamoDBClient({ region: AWS_REGION });

export async function saveInfo(dispositionCode, dispositionDescription) {
  try {
    let paramsIns = {
      TableName: Disposition,
      Item: {
        dispositionCode: { S: dispositionCode },
        dispositionDescription: { S: dispositionDescription },
      },
    };
    const command = new PutItemCommand(paramsIns);
    const response = await client.send(command);
  } catch (error) {
    console.log(error);
  }
}

export async function updateInfo(dispositionCode, updateKey, updateValue) {
  try {
    let paramsIns = {
      TableName: Disposition,
      Key: {
        dispositionCode: { S: dispositionCode },
      },
      UpdateExpression: "set #updateKey = :updateValue",
      ExpressionAttributeNames: {
        "#updateKey": updateKey,
      },
      ExpressionAttributeValues: {
        ":updateValue": { S: updateValue },
      },
    };
    console.log("UpdateItemCommand ", paramsIns);
    const command = new UpdateItemCommand(paramsIns);
    const response = await client.send(command);
  } catch (error) {
    console.log(error);
  }
}

export async function query(dispositionCode) {
  try {
    let paramsIns = {
      TableName: Disposition,
      KeyConditionExpression: "dispositionCode = :dispositionCode",
      ExpressionAttributeValues: {
        ":dispositionCode": { S: dispositionCode },
      },
    };
    console.log("QueryCommand ", paramsIns);
    const command = new QueryCommand(paramsIns);
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function scanAll() {
  let response;
  try {
    let paramsIns = {
      TableName: Disposition,
    };

    console.log("ScanCommand ", paramsIns);
    const command = new ScanCommand(paramsIns);
    response = await client.send(command);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
  return response;
}

export async function scanAndFormat() {
  let dispositionCodes = '';
  try {
    let paramsIns = {
      TableName: Disposition,
    };

    console.log("ScanCommand ", paramsIns);
    const command = new ScanCommand(paramsIns);
    let response = await client.send(command);

    if (response && response.Items && response.Items.length > 0) {
      for (let index = 0; index < response.Items.length; index++) {
        const element = response.Items[index];
        dispositionCodes += '<' + element.dispositionCode.S + '> <description>' + element.dispositionDescription.S + '</description> </' + element.dispositionCode.S + '> ';
      }
    }
  } catch (error) {
    console.log(error);
  }
  return dispositionCodes;
}

