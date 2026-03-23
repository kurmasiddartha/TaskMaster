const mongoose = require('mongoose');
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('MongoDB connection skipped: MONGO_URI is not defined.');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};

module.exports = connectDB;