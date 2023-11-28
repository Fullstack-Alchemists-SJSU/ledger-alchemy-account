import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';

import express, { Request, Response } from 'express';
import { Products, CountryCode, AccountBase } from 'plaid';
import sequelize from '../../db/db';
import BankAccount from '../../db/models/BankAccount';
import plaidClient from '../../utils/plaidClient';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized');
});

app.get('/', (req: Request, res: Response) => {
    res.send('Account Microservice is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/create_link_token', async (req: Request, res: Response) => {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: '1', }, // fetch actual user ID from table
            client_name: 'Ledger Alchemy',
            products: [Products.Auth, Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
        });

        console.log("create_link_token response: ", response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/exchange_public_token', async (req: Request, res: Response) => {
    const { public_token } = req.body;
    try {
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
        const access_token = exchangeResponse.data.access_token;

        console.log("access_token: ", access_token);

        // Fetch account details
        const accountsResponse = await plaidClient.accountsGet({ access_token });
        const accounts = accountsResponse.data.accounts;
        const item_id = accountsResponse.data.item.item_id;

        console.log("Accounts Response: ", accountsResponse.data);

        // Store access token and account details in the database
        for (const account of accounts) {
            await storeAccountData(1 /*user id*/, access_token, account);
        }

        res.json({ message: 'Account linked and data stored successfully.' });
    } catch (error) {
        console.error('Error in token exchange:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to store access token and account details
async function storeAccountData(userId: number, accessToken: string, account: any) {
    const { account_id } = account;

    await BankAccount.create({
        user_id: userId,
        access_token: accessToken,
        account_id: account_id,
    });
}