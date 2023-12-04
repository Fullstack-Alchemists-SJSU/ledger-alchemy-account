import { DataTypes } from 'sequelize';
import sequelize from '../db';

const BankAccount = sequelize.define('BankAccount', {
    user_id: {
        type: DataTypes.STRING,
    },
    access_token: {
        type: DataTypes.STRING,
    },
    account_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
}, {
    tableName: 'Bank_Accounts',
    timestamps: false,
});

export default BankAccount;
