# Auto post contact disposition with Generative AI

## Introduction
Call dispositions are essential for Contact Center to track agent performance, identify customer trends, improve customer satisfaction, and meet compliance requirements. By categorizing the outcome of each call, managers gain valuable insights into agent effectiveness, common customer issues, and areas needing improvement. However, ensuring accuracy, consistency, and efficient use of dispositions pose challenges, along with managing the large volume of data generated. Using Generative AI auto call disposition feature, Contact Centers can maximize the benefits of call dispositions and enhance overall performance.

## Prerequisites
It is assumed that you understand the use of the services below and you have the following prerequisites:
1. An AWS account with both management console and programmatic administrator access.
2. An existing Amazon Connect instance.
3. Enable Amazon Bedrock.
4. [Amazon Connect Contact Lens post contact summarization is enabled](https://docs.aws.amazon.com/connect/latest/adminguide/view-generative-ai-contact-summaries.html).
5. Install [nodejs](https://nodejs.org/en) in your local computer



## Architecture diagram 

In the below architecture, there are five mains steps:

1. You upload the disposition code name and definition in the csv file for the LLM to identify correct disposition code for you business.

2. Amazon Connect Contact lens delivers the speech analytics output file in the Amazon S3 bucket. The Contact lens file contains the transcript and the conversation summary.

3. When the Contact lens file arrives in Amazon S3, an AWS Lambda function checks Amazon Dynamo DB for the definition of the disposition code.

4. The call transcription, contact summary, and disposition code definitions are finally sent to the Amazon Bedrock service. The Amazon Bedrock responds with the disposition code name.

5. The disposition code name from Amazon Bedrock is linked to the Contact attribute in Amazon Connect using the update contact attribute API

![Architecture Diagram](images/auto-disposition-architecture.drawio.png?raw=true)

Note: The update to the Contact attribute will reprocess the Contact Record through Amazon Kinesis Stream (if you have turned on Contact record streaming)

## Walkthrough

1. Download the content [here](https://github.com/aws-samples/auto-disposition-after-contact-using-genai/archive/refs/heads/main.zip) and unzip.
2. Go inside source-code folder and Run "npm install"
3. Zip the contents of source-code folder with name source-code.zip (the steps 1 to 3 installs all the required node modules)
4. Create a new Amazon S3 bucket in your AWS account.
5. Upload the source-code.zip file (step 3) into Amazon S3 Bucket (step 4).
6. Download and run the CFT located [here](cft/).
7. The following parameters are needed for the CFT
    1. **ConnectContactLensS3Bucket:** Copy the Data storage S3 bucket name (only) from the Amazon Connect instance, where Amazon Connect delivers the Contact Lens output file.
    2. **ConnectInstanceARN**: Copy it from the Amazon Connect console.
    3. **DispositionBucketName** : Should be globally uniqie
    4. **SolutionSourceBucket**: Created in step 4
    ![Properties](images/cft-stack.png?raw=true)
8. Once CloudFormation execution is successful, configure the Amazon S3 event.
9. Navigate to Amazon Connect S3 data store bucket (step 7.1)
    1. Click on Properties
    ![Properties](images/bucket-properties.png?raw=true)
    2. Click on Create event notification
    ![Properties](images/s3-evnet-notification-enable.png?raw=true)
    3. Configure one of the following option
        1. Option 1: With Contact Lense redaction turned on, configure two events for the respective channel
           
            For Voice channel
           
                Enter a logical event name, e.g. cases-voice-sum
                Prefix: Analysis/Voice/Redacted
                Suffix: .json
           
            For Chat channel
           
                Enter a logical event name, e.g. cases-chat-sum
                Prefix: Analysis/Chat/Redacted
                Suffix: .json
        3. Option 2: With NO Contact Lense redaction, configure two events for the respective channel
           
            For Voice channel
           
                Enter a logical event name, e.g. cases-voice-sum
                Prefix: Analysis/Voice
                Suffix: .json
           
            For Chat channel
           
                Enter a logical event name, e.g. cases-chat-sum
                Prefix: Analysis/Chat
                Suffix: .json
        Screenshot example below
        ![Properties](images/event-notification-cl.png?raw=true)

    4. Select Put under event types
    ![Properties](images/notification-type.png?raw=true)
    5. Under the destination, select Lambda function (or put the Lambda ARN) and specific the AWS lambda function name **“ContactLenS3EventLambda”**
    ![Properties](images/lambda.png?raw=true)
10. Navigate to Amazon S3 disposition bucket bucket created with the CFT
![Properties](images/disposition-bucket.png?raw=true)
    1. Click on Properties
    2. Click on Create event notification
    3. Configure the event notification
    4. Select **Put** under event types
    5. Under the destination, select Lambda function (or put the Lambda ARN) and specific the AWS lambda function name **“DispositionS3EventLambda”**
11. Download the **"dispositioncodes.csv"** file [here](csv/) from location here 
12. Update the **"dispositioncode.csv"** with disposition code name and the definition.
13. Upload the updated **"dispositioncodes.csv"** to S3 bucket created as part of CFT execution (same as step 10)

## Validate
1. You see the disposition code name and the disposition definitions in the Amazon DynamoDB table. Similar to below screesnhot.
![Properties](images/dynamodb.png?raw=true)
2. Place test calls to your Amazon Connect instance and have conversation with the agent. 
3. Validate you see the Contact Summarization in the contact search page. **If no contact summary is generated, the auto disposition will not work as summary is necessary for the LLM to provide correct disposition code name (i.e. improve accuracy)**
![Properties](images/cl-summary.png?raw=true)
4. You will see the disposition code in the Contact Search page under the contact attribute
![Properties](images/disposition-code.png?raw=true)

## Conclusion
In this guide, you learned how to define your disposition code, use contact lens speech analytics and generative AI to auto dispose your contact.