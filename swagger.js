const swaggerAutogen = require('swagger-autogen')();
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const doc = {
  info: {
    title: 'PACACEA API',
    description: '後端 API 文件',
  },
  host: process.env.host,
  schemas: ['http', 'https'],
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      in: 'header',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
