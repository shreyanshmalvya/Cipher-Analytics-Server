const db = require("../dbconfig.js");

(async () => {
    try {
        await db.schema.createTable("crimes", (table) => {
            table.increments("id").primary();
            table.string("city").notNullable();
            table.string("category").notNullable();
            table.date("date").notNullable();
            table.integer("frequency").notNullable();
            table.boolean("resolved").notNullable();
            table.timestamps(true, true);
        });

        await db.schema.createTable("city_crime", (table) => {
            table.increments("id").primary();
            table.string("city").notNullable();
            table.string("crime").notNullable();
            table.integer("frequency").notNullable();
            table.integer("prev_month_frequency").nullable();
            table.date("timestamp").notNullable();
            table.timestamps(true, true);
        });

        await db.schema.createTable("category_crime", (table) => {
            table.increments("id").primary();
            table.string("category").notNullable();
            table.string("crime").notNullable();
            table.integer("frequency").notNullable();
            table.integer("prev_month_frequency").nullable();
            table.date("timestamp").notNullable();
            table.timestamps(true, true);
        });

        console.log("Tables created successfully.")
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
})();
