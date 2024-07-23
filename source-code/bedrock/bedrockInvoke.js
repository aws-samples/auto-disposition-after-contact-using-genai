import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const AWS_REGION = process.env.AWS_REGION;  

let PROMPT = " You will be provided with a list of disposition codes used to categorize customer service calls, followed by the transcript or summary of a specific \
customer service call. Your task is to select the single most appropriate disposition code to categorize that call. \
Here are the disposition codes: \
<disposition_codes> \
{DISPOSITION CODES} \
</disposition_codes> \
Here is the text of the call to categorize: \
<call_text> \
Call Transcript : \
{CALL TRANSCRIPT} \
Call Summary : \
{CALL SUMMARY} \
</call_text> \
Carefully review the details of the call, and select the one disposition code that best matches the primary reason for the call and outcome of the call based on the descriptions in the disposition codes list. \
Return the output in json format with reasoning and code field. \
In the reasoning, explain in a few sentences why you selected that particular code as the best match, referencing specific details from the call text and disposition code description. \
In the code, output the code you selected. \
Here is the output format: \
{\"reasoning\":\"<reasoning>\",\"code\":\"<code>\"} \
";

export async function bedrockInvoke(modelName, modelId, dispositionCodesText, callTranscriptText, callSummaryText){
  
    console.log("Model Name: ", modelName);
    console.log("Model Id: ", modelId);
    console.log("dispositionCodesText: ", dispositionCodesText);
    console.log("callTranscriptText: ", callTranscriptText);
    console.log("callSummaryText: ", callSummaryText);

    PROMPT = PROMPT.replace("{DISPOSITION CODES}", dispositionCodesText);
    PROMPT = PROMPT.replace("{CALL TRANSCRIPT}", callTranscriptText);
    PROMPT = PROMPT.replace("{CALL SUMMARY}", callSummaryText);

    console.log(`Prompt: ${PROMPT}\n`);
    console.log("Invoking model...\n");
  
    let trascript = "";
    let summary = "";

    // Create a new Bedrock Runtime client instance.
    const client = new BedrockRuntimeClient({ region: AWS_REGION });
  
    // Prepare the payload for the model.
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      messages: [{ role: "user", content: [{ type: "text", text: PROMPT }] }],
    };
  
    // Invoke Claude with the payload and wait for the response.
    const apiResponse = await client.send(
      new InvokeModelCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId: modelId,
      }),
    );
  
    // Decode and return the response(s)
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
    /** @type {ResponseBody} */
    const responseBody = JSON.parse(decodedResponseBody);
    const responses = responseBody.content;
  
    if (responses.length === 1) {
      console.log(`Response: ${responses[0].text}`);
    } else {
      console.log("multiple responses:");
      console.log(responses);
    }

    console.log(`\nNumber of input tokens:   ${responseBody.usage.input_tokens}`);
    console.log(`Number of output tokens: ${responseBody.usage.output_tokens}`);  
    
    let llmOutput = JSON.parse(responses[0].text);

    return llmOutput;
  };
