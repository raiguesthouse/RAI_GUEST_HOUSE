const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Update the Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVU24aKsvOD6wd2_p70vaNeeF-H4PA9PjT1SQkjgFPKdc0Yl0-8Rt87B4eovgi--eX/exec';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to Rai Guest House Proxy Server 🚀');
});

app.get('/menu', async (req, res) => {
    try {
        console.log('Fetching menu...');
        // Add parameters for menu structure
        const response = await axios.get(`${APPS_SCRIPT_URL}?action=getMenu&spreadsheetId=1RzPVjVA635R8GgjKSsvTLW2tC-FpVB0JdwVpp7ffVys&sheetName=Menu`);
        console.log('Menu response:', response.data);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        if (error.response) {
            console.error('Apps Script error response:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch menu: ' + error.message });
    }
});

app.post('/submit-order', async (req, res) => {
    try {
        console.log('Submitting order...', req.body);
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error('Request body khali hai.');
        }

        // Restructure order data
        const orderDataWithSheet = {
            action: 'submitOrder',
            spreadsheetId: '1RzPVjVA635R8GgjKSsvTLW2tC-FpVB0JdwVpp7ffVys',
            data: {
                roomNumber: req.body.roomNumber,
                mobileNumber: req.body.mobileNumber,
                orderItems: req.body.items,
                total: req.body.total,
                timestamp: new Date().toISOString()
            }
        };

        const response = await axios.post(
            APPS_SCRIPT_URL,
            orderDataWithSheet,
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                } 
            }
        );

        console.log('Apps Script response:', response.data);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(response.data);
    } catch (error) {
        console.error('Error submitting order:', error.message);
        if (error.response) {
            console.error('Apps Script error response:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to submit order: ' + error.message });
    }
});

app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;