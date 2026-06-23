// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so your separate frontend can fetch data without being blocked by the browser
app.use(cors());
app.use(express.json());

// Bind our CRUD endpoints 
app.use('/api/portfolio', portfolioRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// This code activates the network listener process
app.listen(PORT, () => {
    console.log(`🚀 Isolated Backend Server running smoothly on port ${PORT}`);
});