import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

export default handler => middy(handler).
  use([
    httpJsonBodyParser(),// parse our stringify body parser
    httpEventNormalizer(),  //will adjust the api gateway event and prevent us from accidentally encountering error when parameters are not available or path parameters are not available
    httpErrorHandler() //makes error handling process smooth and clean by working with http error handler 
  ])
