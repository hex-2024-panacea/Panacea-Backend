const swaggerAutogen = require('swagger-autogen')();
const dotenv = require('dotenv');

require('dotenv').config();
dotenv.config({ path: './.env' });

const doc = {
  info: {
    title: 'PACACEA API',
    description: '後端 API 文件',
  },
  host: process.env.host,
  schema: ['http', 'https'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
