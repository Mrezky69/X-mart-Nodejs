const { getMongoDB } = require('../db/mongodb');

const insertTransaksi = async (transaksiData) => {
    try {
        const db = getMongoDB();
        const collection = db.collection('transaksi');
        await collection.insertOne({ ...transaksiData, tanggalJam: new Date() });
    } catch (err) {
        console.error('Error inserting transaksi:', err);
        throw new Error('Error inserting transaksi');
    }
};

module.exports = { insertTransaksi };
