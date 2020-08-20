const router = require("express").Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");

// Pull full voters table from database
router.get("/voters", (req, res) => {
    const sql = `SELECT * FROM voters ORDER BY last_name`;
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

// Pull an individual voter by id
router.get("/voter/:id", (req, res) => {
    const sql = `SELECT * FROM voters WHERE id = ?`;
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

// Add a voter to the database
router.post('/voter', ({body}, res) => {

    console.log(body);

    // Check if data in body is correct
    const errors = inputCheck(body, 'first_name', 'last_name', 'email');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // Run sql command
    const sql = `INSERT INTO voters (first_name, last_name, email) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.email];
  
    db.run(sql, params, function(err, data) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
    
        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

// Update an existing voter's email given voter's id
router.put('/voter/:id', (req, res) => {

    // Check email is correct in body
    const errors = inputCheck(req.body, 'email');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
  
    // Update email in database
    const sql = `UPDATE voters SET email = ? WHERE id = ?`;
    const params = [req.body.email, req.params.id];
    db.run(sql, params, function(err, data) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});

// Delete a voter from the database
router.delete("/voter/:id", (req, res) => {
    const sql = `DELETE FROM voters WHERE id = ?`;
    const params = req.params.id;
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({error: res.message});
            return;
        }
        res.json({
            message: "deleted", 
            changes: this.changes
        });
    });
});

module.exports = router;