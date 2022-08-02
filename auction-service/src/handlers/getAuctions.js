import AWS from 'aws-sdk';
import commonMiddleware from '../../lib/commonMiddleware';
import validator from '@middy/validator';
import createError from 'http-errors';
import getAuctionsSchema from '../../lib/schemas/getAuctionsSchema';


const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
 
    const {status} = event.queryStringParameters;

    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues:{
            ':status': status, 
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };

  try {
      const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError("oops! soemthing went wrong");
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions).use(
    validator({
        inputSchema: getAuctionsSchema,
        ajvOptions:{
            useDefaults:true,
            strict: false,
        },
    })
)
//    .use(httpJsonBodyParser()) // parse our stringify body parser
//    .use(httpEventNormalizer())  //will adjust the api gateway event and prevent us from accidentally encountering error when parameters are not available or path parameters are not available
//    .use(httpErrorHandler()); //makes error handling process smooth and clean by working with http error handler 
