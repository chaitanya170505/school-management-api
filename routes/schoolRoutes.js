// routes/schoolRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");


router.get('/', (req, res) => {
  res.send('School Management API is running');
});


// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const query =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  const values = [name, address, latitude, longitude];

  db.query(query, values, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "School added successfully" });
  });
});

// sorting the array
function compareDistance(a, b) {
  return a.distance - b.distance;
}

// GET /listSchools?latitude=..&longitude=..
router.get("/listSchools", (req, res) => {
  const { latitude, longitude } = req.query;

  // validation
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  // fetch data from db
  db.query("SELECT * FROM schools", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // adding distance from coordinate to every school
    // calculateDistance function to every school in the db
    const schoolsWithDistance = results.map((school) => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        school.latitude,
        school.longitude
      );

      // normal object properties + distance
      return { ...school, distance };
    });

    schoolsWithDistance.sort(compareDistance);

    // Step 3: Return the array of school objects with distance
    res.json(schoolsWithDistance);
  });
});

module.exports = router;
