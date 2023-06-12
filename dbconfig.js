const knex = require('knex')

module.exports = knex({
  client: 'postgres',
  connection: {
    host: ${{Postgres.PGHOST}},  
    user: ${{Postgres.PGUSER}},
    password: ${{Postgres.PGPASSWORD}},
    database: ${{Postgres.PGDATABASE}},
    port: ${{Postgres.PGPORT}},
  },
})