const { Pool } = require('pg');
const { getMongoDB } = require('./mongodb');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'X_mart',
    password: 'postgres',
    port: 5432,
});

const transferTransaksiToPostgres = async () => {
    try {
        const client = await pool.connect();
        const db = getMongoDB();
        const collection = db.collection('transaksi');
        const transactions = await collection.find().toArray();

        await client.query('BEGIN');

        for (const transaction of transactions) {
            const { qrCode, rfid, hargaSatuan, jumlah, tanggalJam } = transaction;

            const existingTransaction = await client.query('SELECT * FROM transaksi WHERE qrcode = $1 AND rfid = $2 AND harga_satuan = $3 AND jumlah = $4 AND tanggal_jam = $5', [qrCode, rfid, hargaSatuan, jumlah, tanggalJam]);

            if (existingTransaction.rows.length === 0) {
                const insertQuery = {
                    text: 'INSERT INTO transaksi (qrcode, rfid, harga_satuan, jumlah, tanggal_jam) VALUES ($1, $2, $3, $4, $5)',
                    values: [qrCode, rfid, hargaSatuan, jumlah, tanggalJam],
                };
                await client.query(insertQuery);
            }
        }

        await client.query('COMMIT');
        client.release();

        console.log('Data transaksi berhasil ditransfer ke Postgres.');
    } catch (err) {
        console.error('Error transferring transactions to Postgres:', err);
        throw new Error('Error transferring transactions to Postgres');
    }
};


module.exports = { transferTransaksiToPostgres };
