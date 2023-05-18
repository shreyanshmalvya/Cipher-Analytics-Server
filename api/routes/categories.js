const db = require("../../dbconfig.js");
const { Router } = require("express");
const router = Router();

//get all crimes from the category_crime table
router.get("/", async (req, res) => {
  try {
    const categories = await db.select().table("category_crime");
    res.status(200).json(categories);
  } catch {
    console.log(err);
    res.status(500).send(err);
  }
});

//get crime in a city by city name and total frequency
router.get("/ind/:category", async (req, res) => {
  try {
    const categoryCrime = await db
      .select("crime", "frequency")
      .from("category_crime")
      .where("category", req.params.category);
    const totalFrequency = categoryCrime.reduce(
      (total, curr) => total + curr.frequency,
      0
    );
    res.status(200).json({
      category: req.params.category,
      crimeFrequency: categoryCrime,
      totalFrequency: totalFrequency,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//get category with highest crime frequency and then with percentage increase or decrease
router.get("/highestCrime", async (req, res) => {
  try {
    console.log("hello");
    const result = await db
      .select("category")
      .sum("frequency as totalFrequency")
      .from("category_crime")
      .groupBy("category")
      .orderBy("totalFrequency", "desc")
      .first();

    const highestCategory = result.category;

    const secondResult = await db
      .select("category")
      .sum("frequency as totalFrequency")
      .from("category_crime")
      .groupBy("category")
      .orderBy("totalFrequency", "desc")
      .offset(1)
      .first();

    const highestFrequency = result.totalFrequency;
    const secondFrequency = secondResult.totalFrequency;

    const percentageChange = (
      ((highestFrequency - secondFrequency) / secondFrequency) *
      100
    ).toFixed(2);

    const changeCategory =
      percentageChange > 5
        ? "increase"
        : percentageChange > 0
        ? "moderateIncrease"
        : percentageChange < -5
        ? "decrease"
        : percentageChange < 0
        ? "moderateDecrease"
        : "unchanged";

    res.json({
      highestCategory,
      highestFrequency,
      percentageChange,
      changeCategory,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//get top7 category with highest frequency
router.get("/top7", async (req, res) => {
  try {
    const result = await db
      .select("category")
      .sum("frequency as totalFrequency")
      .from("category_crime")
      .groupBy("category")
      .orderBy("totalFrequency", "desc")
      .limit(7);

    res.json(result);
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
