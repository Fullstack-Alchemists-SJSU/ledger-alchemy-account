FROM node:20
RUN mkdir /home/account-microservice
ENV AUTH0_ISSUER_BASE_URL=https://dev-o0wlmqnftb0wbnzm.us.auth0.com/
ENV AUTH0_AUDIENCE=https://app.ledgeralchemy.online/api/v1
ENV DATABASE_NAME=ledger_alchemy_user
ENV DATABASE_NAME=ledger_alchemy_user
ENV DATABASE_USER=master_admin
ENV DATABASE_PASSWORD=master_password_2023
ENV DATABASE_HOST=ledger-alchemy-db.c124ob5uiexx.us-west-1.rds.amazonaws.com
ENV PLAID_CLIENT_ID=65384a6b2482d4001bfc7206
ENV PLAID_SECRET=21fa1334bfafaea49377b531145a48
ENV PLAID_ENV=sandbox
# ENV DATABASE_USER=root
# ENV DATABASE_PASSWORD=root@123
# ENV DATABASE_HOST=localhost
ENV DATABASE_PORT=3306
ENV OPENAI_API_KEY=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
COPY . /home/account-microservice
WORKDIR /home/account-microservice
RUN npm install
EXPOSE 3300
CMD ["npm", "run", "dev"]