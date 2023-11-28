import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST
} = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST) {
    throw new Error('Please define the DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST environment variables');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
});

export default sequelize;
