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
        const response = await axios.get('https://script.google.com/macros/s/AKfycbyOk4RILEo1pK6Xk2PhJs1n56CPcBuN6ch_Zs29LOElT3KhInfxP8bi055oeBb83RIy/exec');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Proxy for order submission (POST request)
app.post('/submit-order', async (req, res) => {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycby1CelOOr1BpO_B1paPdAncxhKamzFzNrU_lCK-6-igGsGF-wd2mcOoRfn4P7O9VNau/exec', req.body, {
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