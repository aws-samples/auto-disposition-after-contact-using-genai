import { getS3ObjetData } from "./s3/s3bucket.js";
import { bedrockInvoke } from "./bedrock/bedrockInvoke.js";
import { updateCtr } from "./connect/ctrUpdate.js";
import { scanAndFormat } from "./dynamodb/disposition.js";

const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
const modelName = 'Anthropic Claude 3 Sonnet';

const ConnectInstanceARN = process.env.ConnectInstanceARN;

export const handler = async (event, context) => {
  let result = {};
  result['output'] = false;
  
  let connectInstanceARNSplit = ConnectInstanceARN.split("/");
  let instanceId = connectInstanceARNSplit[connectInstanceARNSplit.length - 1];

  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];

    const bucket = event.Records[i].s3.bucket.name;

    const key = decodeURIComponent(event.Records[i].s3.object.key.replace(/\+/g, ' '));

    let objectBody = await getS3ObjetData(bucket, key);

    let objectBodyJson = JSON.parse(objectBody);
    let postCallSummary;
    let ContactId;
    let callTranscript='';
    
    if(objectBodyJson && objectBodyJson.JobStatus === 'COMPLETED' && objectBodyJson.CustomerMetadata && objectBodyJson.CustomerMetadata.ContactId){
      ContactId = objectBodyJson.CustomerMetadata.ContactId;

      if(objectBodyJson && objectBodyJson.ConversationCharacteristics && objectBodyJson.ConversationCharacteristics.ContactSummary 
        && objectBodyJson.ConversationCharacteristics.ContactSummary.PostContactSummary && objectBodyJson.ConversationCharacteristics.ContactSummary.PostContactSummary.Content){
          postCallSummary = objectBodyJson.ConversationCharacteristics.ContactSummary.PostContactSummary.Content;          
        }
      if(objectBodyJson.Transcript){
        for (let index = 0; index < objectBodyJson.Transcript.length; index++) {
          const transcriptObject = objectBodyJson.Transcript[index];
          callTranscript += transcriptObject.ParticipantId + " : " + transcriptObject.Content + " \n /";
        }
      } 
    }
      
    console.log('callTranscript',callTranscript);
    console.log('postCallSummary',postCallSummary);

    let dispositionCodes = await scanAndFormat();
    console.log('dispositionCodes', dispositionCodes);

    // Disposition by Bedrock
    if(callTranscript && postCallSummary && dispositionCodes){
    let bedrockOutput = await bedrockInvoke(modelName, modelId, dispositionCodes, callTranscript, postCallSummary);
    if(bedrockOutput && bedrockOutput.code && bedrockOutput.reasoning){      
      await updateCtr(
        ContactId, 
        instanceId, 
        'DispositionCode', 
        bedrockOutput.code,
        'Reasoning', 
        bedrockOutput.reasoning,
        );
    }
    }
  }
};