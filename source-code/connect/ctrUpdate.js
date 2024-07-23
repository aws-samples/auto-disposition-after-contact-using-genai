import { ConnectClient, UpdateContactAttributesCommand } from "@aws-sdk/client-connect";

const client = new ConnectClient({ region: process.env.AWS_REGION });

export async function updateCtr(contactId, instanceId, attributeKey1, attributeValue1, attributeKey2, attributeValue2) {
    const output = {};
    const input = {
        Attributes: {
            [attributeKey1]: `${attributeValue1}`,
            [attributeKey2]: `${attributeValue2}`
        },
        InitialContactId: contactId,
        InstanceId: instanceId
    };

    console.log('input', JSON.stringify(input));

    const command = new UpdateContactAttributesCommand(input);
    const response = await client.send(command);
    console.log('response', response, contactId);

    return output;
}
