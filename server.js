const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "mydatabase"
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    console.error(err);
    return;
  }
  console.log("Connected to MySQL");
});

const app = express();
app.use(bodyParser.json({ limit: "200mb" }));

// Serve static files from the root directory
app.use(express.static("./"));

// Optional: Default route to serve index.html
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

app.post("/api/check", (req, res) => {
  const { sourceCoordinates, destCoordinates } = req.body;
  db.query(
    "SELECT algResults FROM genetic_data WHERE sourceCoordinates = ? AND destCoordinates = ?",
    [JSON.stringify(sourceCoordinates), JSON.stringify(destCoordinates)],
    (err, results) => {
      if (err) {
        res.status(500).send("Database error");
        return;
      }
      if (results.length > 0) {
        const algResultsObject = JSON.parse(results[0].algResults);
        res.json({ exists: true, algResults: algResultsObject });
      } else {
        res.json({ exists: false });
      }
    }
  );
});

app.post("/api/save-result", (req, res) => {
  const { sourceCoordinates, destCoordinates, algResults } = req.body;

  db.query(
    "INSERT INTO genetic_data (sourceCoordinates, destCoordinates, algResults) VALUES (?, ?, ?)",
    [
      JSON.stringify(sourceCoordinates),
      JSON.stringify(destCoordinates),
      JSON.stringify(algResults),
    ],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving to database");
        return;
      }
      res.send({ message: "Data saved successfully", id: results.insertId });
    }
  );
});


app.delete("/api/delete-directions", (req, res) => {
  const { sourceCoordinates, destCoordinates } = req.body;
  db.run(
    "DELETE FROM genetic_data WHERE sourceCoordinates = ? AND destCoordinates = ?",
    [
      JSON.stringify(sourceCoordinates),
      JSON.stringify(destCoordinates),
    ],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting directions from the database");
        return;
      }
      res.status(200).send({ message: "Data deleted successfully" });
    }
  );
});



app.listen(3000, () => console.log("Server running on port 3000"));
