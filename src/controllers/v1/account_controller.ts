import dotenv from 'dotenv';
dotenv.config();

import { Products, CountryCode } from 'plaid';
import sequelize from '../../db/db';
import BankAccount from '../../db/models/BankAccount';
import plaidClient from '../../utils/plaidClient';
import { errorResponses, responseWithData, successResponses } from '../../utils/responses';
import { hashAccessToken } from '../../utils/bcrypt';

sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized');
});

export const createLinkToken = async (req: any, res: any) => {
    // if (!req.body) {
    //     return res.status(400).json(errorResponses.INSUFFICIENT_DATA);
    // }

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
        res.status(201).json(successResponses.LINK_TOKEN_CREATED);
    } catch (error) {
        console.error('Error in token exchange:', error);
        res.status(400).json(responseWithData(errorResponses.SOMETHING_WENT_WRONG, error));
    }
};

export const exchangePublicToken = async (req: any, res: any) => {
    // if (!req.body) {
    //     return res.status(400).json(errorResponses.INSUFFICIENT_DATA);
    // }
    const { public_token } = req.body;
    try {
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
        const access_token = exchangeResponse.data.access_token;

        console.log("access_token: ", access_token);

        // hash access token before storing in database
        const hashedAccessToken = await hashAccessToken(access_token);

        // Fetch account details
        const accountsResponse = await plaidClient.accountsGet({ access_token });
        const accounts = accountsResponse.data.accounts;
        const item_id = accountsResponse.data.item.item_id;

        console.log("Accounts Response: ", accountsResponse.data);

        // Store access token and account details in the database
        for (const account of accounts) {
            await storeAccountData(1 /*user id*/, hashedAccessToken, account);
        }

        res.json({ message: 'Account linked and data stored successfully.' });
        res.status(201).json(successResponses.ACCESS_TOKEN_CREATED);
    } catch (error) {
        console.error('Error in token exchange:', error);
        res.status(400).json(responseWithData(errorResponses.SOMETHING_WENT_WRONG, error));
    }
};

// Function to store access token and account details
async function storeAccountData(userId: number, accessToken: string, account: any) {
    const { account_id } = account;

    await BankAccount.create({
        user_id: userId,
        access_token: accessToken,
        account_id: account_id,
    });
}