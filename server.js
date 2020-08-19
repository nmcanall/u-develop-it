const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Connect to database
const db = new sqlite3.Database("./db/election.db", err => {
    if(err) {
        return console.error(err.message);
    }
    console.log("Connected to the election database.");
});

// Pull entire database and console log as an array of objects where each object is a row ('rows' variable)
db.all(`SELECT * FROM candidates`, (err, rows) => {
    console.log(rows);
});

// GET a single candidate from the database by reading
db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
    if(err) {
        console.log(err);
    }
    console.log(row);
});

// DELETE a single cadidate from the database by id
db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result) {
    if(err) {
        console.log(err);
    }
    console.log(this, this.changes);
});

// CREATE a new candidate in the database
const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected)
              VALUES (?,?,?,?)`;
const params = [1, "Ronald", "Firbank", 1];
db.run(sql, params, function(err, result) {
    if(err) {
        console.log(err);
    }
    console.log(result, this.lastID);
});

// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});

// Start server after database connection
db.on("open", () => {
    // Listen for API call
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}.`);
    });
});
