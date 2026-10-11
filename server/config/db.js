const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dailyWages';
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host} using DB: ${uri.split('/').pop()}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

module.exports = connectDB;
