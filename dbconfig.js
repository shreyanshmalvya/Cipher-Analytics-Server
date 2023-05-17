const knex = require('knex')

module.exports = knex({
  client: 'postgres',
  connection: {
    host: 'databse',
    user: 'postgres',
    password: '123456',
    database: 'postgres',
  },
})