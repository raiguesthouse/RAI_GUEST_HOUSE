// Required modules import karo
const express = require('express'); // Express framework import karo server banane ke liye
const axios = require('axios'); // Axios import karo HTTP requests ke liye
const cors = require('cors'); // CORS import karo taaki frontend se requests aa sakein

// Express app banaye
const app = express();

// Apps Script ka Deploy URL define karo
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTwDnIN2ekF7eqLXP1lPzhY1bJF5r8iyAAh3JeTrer9CSyTqzR3BtOYUK07sgKJm_C/exec'; // Apps Script ka sahi Deploy URL set karo

// CORS ko set karo taaki frontend se requests aa sakein
app.use(cors({
    origin: '*', // Sabhi origins allow karo (frontend se requests ke liye)
    methods: ['GET', 'POST'], // GET aur POST methods allow karo
    allowedHeaders: ['Content-Type'], // Content-Type header allow karo
}));

// Request body ko JSON format mein parse karo
app.use(express.json()); // JSON body parsing ke liye middleware add karo

// Debugging ke liye raw body log karo
app.use((req, res, next) => {
    console.log('Raw request body:', req.body); // Raw body log karo
    console.log('Request headers:', req.headers); // Headers log karo
    next();
});

// CORS headers manually set karo taaki browser block na kare
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Sabhi origins allow karo
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // GET, POST, aur OPTIONS methods allow karo
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Content-Type header allow karo
    next(); // Agle middleware ya route pe jao
});

// Default route banaye
app.get('/', (req, res) => {
    res.send('Welcome to Rai Guest House Proxy Server 🚀'); // Default route pe welcome message bhejo
});

// Menu fetch karne ka API banaye
app.get('/menu', async (req, res) => {
    try {
        // Menu fetch hone ka message console mein dikhao
        console.log('Fetching menu...'); // Menu fetch hone ka message
        // Apps Script se menu fetch karo (GET request bhejo)
        const response = await axios.get(APPS_SCRIPT_URL);
        
        // Response ko log karo (debugging ke liye)
        console.log('Menu response:', response.data); // Response data log karo
        // CORS header set karo taaki frontend access kar sake
        res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header set karo
        // Response data ko JSON format mein bhejo
        res.json(response.data); // Menu data bhejo
    } catch (error) {
        // Error aaye to console mein log karo
        console.error('Error fetching menu:', error.message); // Error message log karo
        // Error response bhejo
        res.status(500).json({ error: 'Failed to fetch menu: ' + error.message }); // Error message bhejo
    }
});

// Order submission ka API banaye
app.post('/submit-order', async (req, res) => {
    try {
        // Request body ko console mein log karo (debugging ke liye)
        console.log('Submitting order...', req.body); // Request body log karo
        // Check karo ki request body khali to nahi hai
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error('Request body khali hai.'); // Agar body khali hai to error throw karo
        }

        // Apps Script pe order data bhejo (POST request bhejo)
        const response = await axios.post(
            APPS_SCRIPT_URL, // Sahi Deploy URL ka use karo
            req.body, // Request body bhejo
            { 
                headers: { 
                    'Content-Type': 'application/json', // Content-Type header set karo
                    'Accept': 'application/json' // Accept header set karo
                } 
            }
        );

        // Response ko log karo (debugging ke liye)
        console.log('Apps Script response:', response.data); // Response data log karo
        // CORS header set karo taaki frontend access kar sake
        res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header set karo
        // Response data ko JSON format mein bhejo
        res.json(response.data); // Response bhejo
    } catch (error) {
        // Error aaye to console mein log karo
        console.error('Error submitting order:', error.message); // Error message log karo
        // Agar axios error hai to response bhi log karo
        if (error.response) {
            console.error('Apps Script error response:', error.response.data); // Error response log karo
        }
        // Error response bhejo
        res.status(500).json({ error: 'Failed to submit order: ' + error.message }); // Error message bhejo
    }
});

// Preflight requests ke liye CORS handle karo (browser ke OPTIONS requests ke liye)
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Sabhi origins allow karo
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // GET, POST, aur OPTIONS methods allow karo
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Content-Type header allow karo
    res.sendStatus(200); // 200 status bhejo
});

// Vercel deployment ke liye app export karo
module.exports = app; // App ko export karo taaki Vercel deploy kar sake