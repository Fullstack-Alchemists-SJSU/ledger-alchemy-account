import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './router';
import bodyParser from 'body-parser';
import cors from 'cors';
import sequelize from './db/db';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ['http://localhost:3000'],
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
    })
);


sequelize.sync().then(() => {
    console.log('Database synchronized');
    app.listen(3200, () => {
        console.log('Server listening on port 3200');
    });
});
router(app);
