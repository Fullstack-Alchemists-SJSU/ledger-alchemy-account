import {Sequelize} from 'sequelize'
require('dotenv').config()

const {DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME} =
	process.env

if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_HOST) {
	throw new Error(
		'Please define the DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST environment variables'
	)
}

const sequelize = new Sequelize(
	DATABASE_NAME,
	DATABASE_USER,
	DATABASE_PASSWORD,
	{
		host: DATABASE_HOST,
		dialect: 'mysql',
	}
)

export default sequelize
