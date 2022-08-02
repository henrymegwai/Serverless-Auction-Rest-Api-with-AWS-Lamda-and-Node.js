import AWS from 'aws-sdk';
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../../lib/schemas/placebidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {

    const { id } = event.pathParameters;
    const { amount } = event.body;
    
  const auction = await getAuctionById(id);

  if(auction.status !== 'OPEN') {
      throw new createError.Forbidden(`You cannot bid on closed auctions!`);
    }
  if(amount <= auction.highestBid.amount){
      throw new createError.Forbidden(`You bid must be higher than ${auction.highestBid.amount}!`);
  }

    //We will be using update in dynamo
  const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues:{
          ':amount': amount,
      },
      ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;

  try {
      const result = await dynamodb.update(params).promise();
      updatedAuction = result.Attributes;
  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError('Oops! an error has occured');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid).use(
    validator({
        inputSchema: placeBidSchema,
        ajvOptions:{
            useDefaults:true,
            strict: false,
        },
    })
);
