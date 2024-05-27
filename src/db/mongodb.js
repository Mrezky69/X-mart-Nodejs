const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'myapp';
let db;

const connectMongoDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

const getMongoDB = () => {
    return db;
};

module.exports = { connectMongoDB, getMongoDB };
