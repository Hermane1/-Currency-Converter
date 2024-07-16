// Import required modules
const express = require('express'); // Express framework for handling HTTP requests
const path = require('path'); // Module for handling file and directory paths
const { Sequelize, DataTypes } = require('sequelize'); // Sequelize ORM for interacting with databases

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite', // Use SQLite as the database dialect
    storage: 'database.sqlite' // Database file location
});

// Define the FavoritePair model with 'base' and 'target' fields
const FavoritePair = sequelize.define('FavoritePair', {
    base: {
        type: DataTypes.STRING, // Base currency field as a string
        allowNull: false // Field is required
    },
    target: {
        type: DataTypes.STRING, // Target currency field as a string
        allowNull: false // Field is required
    }
});

// Sync the model with the database, creating the table if it doesn't exist
sequelize.sync();

// Define the route to get all favorite currency pairs
app.get('/api/favorites', async (req, res) => {
    // Fetch all records from the FavoritePair table
    const favorites = await FavoritePair.findAll();
    res.json(favorites); // Send the records as JSON response
});

// Define the route to create a new favorite currency pair
app.post('/api/favorites', express.json(), async (req, res) => {
    // Extract base and target currency from the request body
    const { base, target } = req.body;
    // Create a new record in the FavoritePair table
    const favorite = await FavoritePair.create({ base, target });
    res.json(favorite); // Send the created record as JSON response
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Log the server port
});
