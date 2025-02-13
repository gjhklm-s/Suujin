const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from 'public' folder

// Connect to SQLite database
const db = new sqlite3.Database("./auction.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL
      )`
    );
  }
});

// Serve index.html on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add a new player
app.post("/addPlayer", (req, res) => {
  const { team, name, price } = req.body;
  if (!team || !name || !price) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.run(
    "INSERT INTO players (team, name, price) VALUES (?, ?, ?)",
    [team, name, price],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json({ id: this.lastID, team, name, price });
    }
  );
});

// Fetch all players
app.get("/players", (req, res) => {
  db.all("SELECT * FROM players", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
});

// Delete a player by ID
app.delete("/removePlayer/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM players WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json({ message: "Player removed successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
