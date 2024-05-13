import { connect } from 'mongoose';
import User from './user';
import 'dotenv/config';
const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;

const connectString: string = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
connect(connectString)

export {
    User
};