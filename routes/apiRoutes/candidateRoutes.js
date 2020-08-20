const router = require("express").Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");

// Pull entire candidates table and console log as an array of objects where each object is a row ('rows' variable)
router.get("/candidates", (req, res) => {
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
router.get("/candidate/:id", (req, res) => {
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
router.delete("/candidate/:id", (req, res) => {
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
router.post("/candidate", ({body}, res) => {

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
router.put("/candidate/:id", (req, res) => {

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

module.exports = router;