const mongoose = require('mongoose');

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    }).catch(error => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

module.exports = connectDB;