require('dotenv').config()

import {Products, CountryCode} from 'plaid'
import BankAccount from '../../db/models/BankAccount'
import plaidClient from '../../utils/plaidClient'
import {errorResponses, responseWithData} from '../../utils/responses'
import redis from '../../utils/redis'

export const createLinkToken = async (req: any, res: any) => {
	const {userSub} = req.body
	if (!userSub) {
		return res.status(400).json(errorResponses.INSUFFICIENT_DATA)
	}
	try {
		const response = await plaidClient.linkTokenCreate({
			user: {
				client_user_id: userSub,
			},
			client_name: 'Ledger Alchemy',
			products: [Products.Auth, Products.Transactions],
			country_codes: [CountryCode.Us],
			language: 'en',
		})

		console.log('create_link_token response: ', response.data)
		res.json(response.data)
	} catch (error) {
		console.error('Error in token exchange:', error)
		res.status(400).json(
			responseWithData(errorResponses.SOMETHING_WENT_WRONG, error)
		)
	}
}

export const exchangePublicToken = async (req: any, res: any) => {
	const {public_token, userSub} = req.body
	if (!userSub || !public_token) {
		return res.status(400).json(errorResponses.INSUFFICIENT_DATA)
	}
	try {
		const exchangeResponse = await plaidClient.itemPublicTokenExchange({
			public_token,
		})
		const access_token = exchangeResponse.data.access_token

		console.log('access_token: ', access_token)

		// hash access token before storing in database
		// const hashedAccessToken = await hashAccessToken(access_token);

		// Fetch account details
		const accountsResponse = await plaidClient.accountsGet({access_token})
		const accounts = accountsResponse.data.accounts
		const item_id = accountsResponse.data.item.item_id

		console.log('Accounts Response: ', accountsResponse.data)

		// Store access token and account details in the database
		for (const account of accounts) {
			await storeAccountData(userSub, access_token, account)
		}

		res.json(accounts)
		// res.json({ message: 'Account linked and data stored successfully.' });
	} catch (error) {
		console.error('Error in token exchange:', error)
		res.status(400).json(
			responseWithData(errorResponses.SOMETHING_WENT_WRONG, error)
		)
	}
}

export async function getAccountData(req: any, res: any) {
	const userSub = req.body.userSub

	const cacheKey = `get_accounts:${userSub}`

	// Try to fetch data from Redis cache
	const cachedData = await redis.get(cacheKey)
	console.log('cachedData: ', cachedData)
	if (cachedData) {
		return res.json(JSON.parse(cachedData))
	}

	try {
		const accounts = await BankAccount.findAll({
			where: {user_id: userSub},
		})

		if (accounts.length === 0) {
			return res
				.status(404)
				.json({message: 'No accounts found for this user.'})
		}

		// Collect unique access tokens
		const uniqueAccessTokens = new Set(
			accounts.map((account) => account.dataValues.access_token)
		)

		// Fetch account details for each unique token
		let allAccountsData: any[] = []
		for (const access_token of uniqueAccessTokens) {
			console.log('access_token in get account data: ', access_token)
			const accountsResponse = await plaidClient.accountsGet({
				access_token: access_token,
			})
			allAccountsData = allAccountsData.concat(
				accountsResponse.data.accounts
			)
		}

		console.log('All Accounts Data: ', allAccountsData)

		redis.set(cacheKey, JSON.stringify(allAccountsData), 'EX', 86400)

		// Return combined account data
		res.json(allAccountsData)
	} catch (error) {
		console.error('Error in fetching accounts Data:', error)
		res.status(400).json(
			responseWithData(errorResponses.SOMETHING_WENT_WRONG, error)
		)
	}
}

// Function to store access token and account details
async function storeAccountData(
	userSub: number,
	accessToken: string,
	account: any
) {
	const {account_id} = account

	await BankAccount.create({
		user_id: userSub,
		access_token: accessToken,
		account_id: account_id,
	})
}
