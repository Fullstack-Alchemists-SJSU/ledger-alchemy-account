import express from 'express';
import router from './router';
import sequelize from './db/db';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ['http://localhost:3001'],
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
    })
);
router(app);
