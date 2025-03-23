const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ CORS properly set karo taaki frontend access kar sake!
app.use(cors({
    origin: '*', // ✅ Sabhi origins allow karo
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// ✅ CORS headers manually add karo taaki browser block na kare!
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// ✅ Default route
app.get('/', (req, res) => {
    res.send('Welcome to Rai Guest House Proxy Server 🚀');
});

// ✅ Menu fetch API
app.get('/menu', async (req, res) => {
    try {
        console.log('Fetching menu...');
        const response = await axios.get('https://script.google.com/macros/s/AKfycbx5fJ5DYZLJb33O65jGqaeXoWCUdiJWo_tJ60FQgNO6OTRANZ9vaf053099NNBk-Sin/exec');
        
        res.setHeader('Access-Control-Allow-Origin', '*'); // ✅ Ensure CORS is set
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).json({ error: 'Failed to fetch menu.' });
    }
});

// ✅ Order submission API
app.post('/submit-order', async (req, res) => {
    try {
        console.log('Submitting order...', req.body);
        const response = await axios.post(
            'https://script.google.com/macros/s/AKfycbyTwDnIN2ekF7eqLXP1lPzhY1bJF5r8iyAAh3JeTrer9CSyTqzR3BtOYUK07sgKJm_C/exec',
            req.body,
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.setHeader('Access-Control-Allow-Origin', '*'); // ✅ Ensure CORS is set
        res.json(response.data);
    } catch (error) {
        console.error('Error submitting order:', error.message);
        res.status(500).json({ error: 'Failed to submit order.' });
    }
});

// ✅ Handle preflight requests for CORS (important)
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// ✅ Export for Vercel deployment
module.exports = app;
