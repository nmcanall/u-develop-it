const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const inputCheck = require('./utils/inputCheck');

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


//////////// CANDIDATES API CALLS ////////////
// Pull entire candidates table and console log as an array of objects where each object is a row ('rows' variable)
app.get("/api/candidates", (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// GET a single candidate from the database by reading
app.get("/api/candidate/:id", (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties ON candidates.party_id = parties.id
                 WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if(err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

// DELETE a single cadidate from the database by id
app.delete("/api/candidate/:id", (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({error: res.message});
            return;
        }
        res.json({
            message: "successfully deleted",
            changes: this.changes
        });
    });
});

// CREATE a new candidate in the database
app.post("/api/candidate", ({body}, res) => {

    // Check if there are errors in the given candidate object
    const errors = inputCheck(body, "first_name", "last_name", "industry_connected");
    if(errors) {
        res.status(400).json({error: errors});
        return;
    }

    // Add given candidate at the end
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                  VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: body,
            id: this.lastID
        });
    });
});

// Update a candidates affiliated party
app.put("/api/candidate/:id", (req, res) => {

    // Check the given party_id
    const errors = inputCheck(req.body, "party_id");
    if(errors) {
        res.status(400).json({error: errors});
        return;
    }

    // Update the database
    const sql = `UPDATE candidates SET party_id = ? WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: req.body,
            changes: this.message
        });
    });
});


//////////// PARTIES API CALLS ////////////

// Pull full parties table from database
app.get("/api/parties", (req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// Get a particular party's information when given an id
app.get("/api/party/:id", (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if(err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

// Delete a party from the database
app.delete("/api/party/:id", (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({error: res.message});
            return;
        }
        res.json({
            message: "successfully deleted",
            changes: this.changes
        });
    });
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
