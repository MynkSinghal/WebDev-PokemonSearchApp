import express from 'express';
const serverless = require('serverless-http');
import path from 'path';
import { Pokedex } from 'pokedex-v2';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const router = express.Router ();
const pokedex = new Pokedex();

(async () => {
    await pokedex.init(); // Initialize the pokedex
})();

// Middleware to serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get Pokémon by name or ID
app.get('/pokemon/:name', async (req, res) => {
    const name = req.params.name.toLowerCase();
    try {
        const pokemon = pokedex.speciesByName(name);
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon not found' });
        }
        res.json({
            id: pokemon.id,
            name: pokemon.name,
            height: pokemon.height,
            weight: pokemon.weight,
            types: pokemon.types.join(', '),
            description: pokemon.description,
        });
    } catch (error) {
        console.error('Error retrieving Pokémon:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
