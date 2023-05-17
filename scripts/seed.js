const db = require("../dbconfig.js");

//add dummy data to all three tables
(async () => {
  try {
    const cities = await db.select().table("city_crime");
    const categories = await db.select().table("category_crime");
    const crimes = await db.select().table("crimes");
    if (cities.length === 0 && categories.length === 0 && crimes.length === 0) {
      //get data from mock data and then make a function to select required fields for each table and pass it to insert
      const mockData = require("./MOCK_DATA.json");
      const crimesData = mockData.map((data) => {
        return {
          id: data.id,
          city: data.city,
          category: data.crime,
          date: data.date,
          frequency: data.frequency,
          resolved: data.resolved,
        };
      });

      const citiesData = mockData.map((data) => {
        return {
          id: data.id,
          city: data.city,
          crime: data.crime,
          frequency: data.frequency,
          timestamp: data.date,
        };
      });

      const categoriesDataData = mockData.map((data) => {
        return {
          id: data.id,
          category: data.crime,
          crime: data.crime,
          frequency: data.frequency,
          timestamp: data.date,
        };
      });

      await db("crimes").insert(crimesData);
      await db("city_crime").insert(citiesData);
      await db("category_crime").insert(categoriesDataData);
      console.log("Dummy data added successfully.");
      process.exit(0);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
