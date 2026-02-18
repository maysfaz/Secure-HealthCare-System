require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Simple origin:true for development
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', require('./src/routes/index'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = 4000;
const MONGO_URI = 'mongodb://localhost:27017/secure-health-pro';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected to secure-health-pro');
        app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
    })
    .catch(err => console.error('DB Connection Error:', err));
