const knex = require('knex');

const triggerFunction = `
CREATE OR REPLACE FUNCTION update_prev_month_frequency()
RETURNS TRIGGER AS $$
DECLARE
    last_month DATE;
BEGIN
    SELECT MAX(date_trunc('month', date)) INTO last_month FROM crimes;
    IF last_month IS NULL OR date_trunc('month', NEW.date) < last_month THEN
        RETURN NEW;
    END IF;

    UPDATE city_crime
    SET prev_month_frequency = frequency
    WHERE city_crime.city = NEW.city AND city_crime.crime = NEW.category;

    UPDATE category_crime
    SET prev_month_frequency = frequency
    WHERE category_crime.category = NEW.category AND category_crime.crime = NEW.city;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

async function createTrigger() {
  try {
    await knex.raw(triggerFunction);

    await knex.schema.raw(`
      CREATE TRIGGER update_prev_month_frequency
      AFTER INSERT ON crimes
      FOR EACH ROW
      EXECUTE FUNCTION update_prev_month_frequency();
    `);

    console.log('Trigger created successfully.');
  } catch (error) {
    console.error(error);
  } finally {
    await knex.destroy();
  }
}

createTrigger();