FROM node:15

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]

# Run migrations
RUN npm run migrate

# Seed the database
RUN npm run seed
