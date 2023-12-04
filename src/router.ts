import express from 'express';
import { createLinkToken, exchangePublicToken, getAccountData } from './controllers/v1/account_controller';

const router = (app: express.Express) => {
    const baseApiRouter = express.Router();
    const v1Router = express.Router();
    const accountRouter = express.Router();

    baseApiRouter.get('/', async (req, res) => {
        res.send('Hello World!');
    });

    /**
     * Account API Routes
     */
    accountRouter.post('/', createLinkToken);
    accountRouter.post('/exchange_public_token', exchangePublicToken);
    accountRouter.post('/get_accounts', getAccountData);

    v1Router.use('/account', accountRouter);

    baseApiRouter.use('/v1', v1Router);
    app.use('/api', baseApiRouter);
};

export default router;