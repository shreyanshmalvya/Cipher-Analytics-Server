const db = require("../../dbconfig.js");
const { Router } = require("express");
const router = Router();

//get all crimes
router.get("/", async (req, res) => {
  try {
    const crimes = await db.select().table("crimes");
    res.status(200).json(crimes);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/total", async (req, res) => {
  try {
    const totalCrimes = await db("crimes").count("id").first();

    const currentDate = new Date();
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const totalCrimesLastWeek = await db("crimes")
      .where("date", ">", lastWeekDate)
      .count("id")
      .first();

    const totalCount = totalCrimes.count;
    const lastWeekCount = totalCrimesLastWeek.count;

    const percentageChange =
      100 -
      Math.abs((((totalCount - lastWeekCount) / totalCount) * 100).toFixed(2));

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
      totalCount,
      lastWeekCount,
      percentageChange,
      changeCategory,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/crimes-by-month", async (req, res) => {
  try {
    // Get the current month and year
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Note: Month is zero-indexed

    // Get the month and year one year ago
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    // Get the data for the current year
    const currentYearRows = await db("crimes")
      .select(db.raw("TO_CHAR(date, 'Mon YY') as month"))
      .sum("frequency as count")
      .whereRaw(
        `EXTRACT(YEAR FROM date) = ? AND EXTRACT(MONTH FROM date) <= ?`,
        [currentYear, currentMonth]
      )
      .groupBy("month");

    // Get the data for the year before
    const yearBeforeRows = await db("crimes")
      .select(db.raw("TO_CHAR(date, 'Mon YY') as month"))
      .sum("frequency as count")
      .where("date", ">=", yearAgo)
      .whereRaw(`EXTRACT(YEAR FROM date) = ?`, [currentYear - 1])
      .groupBy("month");

    // Combine the data for the current year and the year before
    const results = {};
    currentYearRows.forEach((row) => {
      results[row.month] = { currentYear: row.count };
    });
    yearBeforeRows.forEach((row) => {
      if (results[row.month]) {
        results[row.month].yearBefore = row.count;
      } else {
        results[row.month] = { yearBefore: row.count };
      }
    });

    // Format the combined data into an array of objects suitable for charting
    const chartData = Object.keys(results).map((month) => {
      return {
        date: month,
        currentYearCount: results[month].currentYear || 0,
        yearBeforeCount: results[month].yearBefore || 0,
      };
    });

    res.json(chartData);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//city wise active crimes where resolved is false
router.get("/active", async (req, res) => {
  try {
    const crimes = await db("crimes")
      .select("city")
      .where("resolved", false)
      .groupBy("city")
      .count("id")
      .orderBy("count", "desc")
      .limit(5);

    res.status(200).json(crimes);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//post crimes using knex
router.post("/", async (req, res) => {
  try {
    const crime = await db("crimes").insert(req.body);
    res.status(200).json(crime);
  } catch (err) {
    console.log(err);
    req.status(500).send(err);
  }
});

module.exports = router;
