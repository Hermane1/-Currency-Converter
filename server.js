const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const FavoritePair = sequelize.define('FavoritePair', {
    base: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

sequelize.sync();

app.get('/api/favorites', async (req, res) => {
    const favorites = await FavoritePair.findAll();
    res.json(favorites);
});

app.post('/api/favorites', express.json(), async (req, res) => {
    const { base, target } = req.body;
    const favorite = await FavoritePair.create({ base, target });
    res.json(favorite);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
