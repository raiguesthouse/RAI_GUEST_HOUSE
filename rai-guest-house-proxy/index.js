// Required modules import karo Vercel proxy server ke liye.
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // CORS middleware import karo
const app = express();

// CORS middleware ko use karo taaki cross-origin requests allow ho sakein.
app.use(cors({
    origin: 'https://raiguesthouse.github.io'
}));

// Middleware to parse JSON bodies for POST requests.
app.use(express.json());

// Root endpoint ke liye ek simple response add karo.
app.get('/', (req, res) => {
    res.send('Welcome to Rai Guest House Proxy! Use /menu to fetch menu items or /submit-order to place an order.');
});

// Yeh endpoint menu fetch karta hai Apps Script ke /menu endpoint se.
app.get('/menu', async (req, res) => {
    try {
        // Apps Script se menu data fetch karo.
        const response = await axios.get('https://script.google.com/macros/s/AKfycbx5fJ5DYZLJb33O65jGqaeXoWCUdiJWo_tJ60FQgNO6OTRANZ9vaf053099NNBk-Sin/exec');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Yeh endpoint order submit karta hai Apps Script ke /submit-order endpoint pe.
app.post('/submit-order', async (req, res) => {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycbx5fJ5DYZLJb33O65jGqaeXoWCUdiJWo_tJ60FQgNO6OTRANZ9vaf053099NNBk-Sin/exec', req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error submitting order:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// App ko export karo taaki Vercel deploy kar sake.
module.exports = app;