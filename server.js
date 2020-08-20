const express = require("express");
const db = require("./db/database.js");

const PORT = process.env.PORT || 3001;
const app = express();

const apiRoutes = require("./routes/apiRoutes");

// Express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/api", apiRoutes);


// See "./routes/candidatesRoutes.js" for candidates API calls
// See "./routes/partyRoutes.js" for parties API calls
// See "./routes/partyRoutes.js" for voter API calls

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
