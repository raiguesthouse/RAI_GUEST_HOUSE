const express = require('express');
const axios = require('axios');
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());

// Proxy for menu fetch (GET request)
app.get('/menu', async (req, res) => {
    try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbyZyq0P0rgI1O9_OjxmDeYQC5WGBO_ORct45NnRDXP7bwFWI9GlN4w4madOOOhB5oqt/exec');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Proxy for order submission (POST request)
app.post('/submit-order', async (req, res) => {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycbyvjBB-r7TFZEMy9OYirnye9-vhhAoeo6zuMJRw4ZhAjx1WlkdO10WNL1MAV39kXplu/exec', req.body, {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});