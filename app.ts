import express from "express";
import ApiRouter from './routes/api';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', ApiRouter);
app.use('/api-docs',
    require('swagger-ui-express').serve,
    require('swagger-ui-express').setup(require('./spec/swagger.json'))
)
module.exports = app;
