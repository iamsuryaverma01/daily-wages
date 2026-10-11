const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.error(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    const oldSend = res.send;
    res.send = function (data) {
        console.error(`[RESPONSE] ${new Date().toISOString()} - Status: ${res.statusCode}`);
        return oldSend.apply(res, arguments);
    };
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/contractors', require('./routes/contractorRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('DailyWages API is running...');
});

console.log('Environment PORT:', process.env.PORT);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
