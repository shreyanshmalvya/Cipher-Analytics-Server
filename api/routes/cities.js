const db = require("../../dbconfig.js");
const { Router } = require("express");
const router = Router();

// get all crimes from the cities table
router.get("/", async (req, res) => {
  try {
    const cities = await db.select().table("city_crime");
    res.status(200).json(cities);
  } catch {
    console.log(err);
    res.status(500).send(err);
  }
});

//get crime in a city by city name and total frequency
router.get("/ind/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const crime = await db
      .select("crime")
      .sum("frequency as total_frequency")
      .from("city_crime")
      .where("city", "=", city)
      .groupBy("crime");
    res.status(200).json(crime);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//get city with highest crime frequency and then with percentage increase or decrease
router.get("/highestCrime", async (req, res) => {
  try {
    console.log("hello");
    const result = await db
      .select("city")
      .sum("frequency as totalFrequency")
      .from("city_crime")
      .groupBy("city")
      .orderBy("totalFrequency", "desc")
      .first();

    const secondResult = await db
      .select("city")
      .sum("frequency as totalFrequency")
      .from("city_crime")
      .groupBy("city")
      .orderBy("totalFrequency", "desc")
      .offset(1)
      .first();

    console.table([result, secondResult]);

    const highestCity = {
      city: result.city,
      totalFrequency: result.totalFrequency,
      percentage:
        ((result.totalFrequency - secondResult.totalFrequency) /
          secondResult.totalFrequency) *
        100,
    };

    res.status(201).json({
      highestCity,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//get list of top 5 cities with highest crime frequency and their percentage
router.get("/top5", async (req, res) => {
    try {
        const result = await db
            .select("city")
            .sum("frequency as totalFrequency")
            .from("city_crime")
            .groupBy("city")
            .orderBy("totalFrequency", "desc")
            .limit(5);


        const top5 = result.map((city) => {
            return {
                city: city.city,
                totalFrequency: city.totalFrequency,
            }
        }); 

        res.status(201).json({
            top5,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


//post crimes using knex
router.post("/", async (req, res) => {
  try {
    const crime = await db("city_crime")
      .where("city", req.body.city)
      .andWhere("crime", req.body.crime)
      .increment("frequency", 1);
    res.status(200).json(crime);
  } catch (error) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
