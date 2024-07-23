import { getS3ObjetData } from "./s3/s3bucket.js";
import { saveInfo } from "./dynamodb/disposition.js";

export const handler = async (event, context) => {
  let result = { output: false };

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    try {
      const objectBody = await getS3ObjetData(bucket, key);
      console.log(objectBody);

      var rows = objectBody.split("\n"); // SPLIT ROWS

      for (let index = 0; index < rows.length; index++) {
        const rowElement = rows[index];

        if(index > 0 && rowElement && rowElement.includes(',')){
          let dispositionCode = rowElement.substring(0,rowElement.indexOf(','));
          let dispositionDesc = rowElement.substring(rowElement.indexOf(',')+1);
          dispositionDesc = dispositionDesc.replaceAll("\"","");

          console.log(dispositionCode , dispositionDesc);

          await saveInfo(dispositionCode, dispositionDesc);          
        }
      }
    } catch (error) {
      console.error("Error processing S3 event:", error);
    }
  }

  return result;
};
