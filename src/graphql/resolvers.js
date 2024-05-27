const { redisClient } = require('../redis/redisConfig');
const { insertTransaksi } = require('../models/transaksi');
const { transferTransaksiToPostgres } = require('../db/postgres');
const { Pool } = require('pg');

// PostgreSQL Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'X_mart',
    password: 'postgres',
    port: 5432,
});

const resolvers = {
    Query: {
        hello: () => 'Hello from GraphQL!',
    },
    Mutation: {
        checkinBarang: async (_, { rfid }) => {
            console.log(`Received RFID: ${rfid}`);
            try {
                const client = await pool.connect();
                const res = await client.query('SELECT * FROM barang WHERE rfid = $1', [rfid]);
                client.release();

                if (res.rows.length === 0) {
                    console.log(`Barang with RFID: ${rfid} not found`);
                    return {
                        success: false,
                        message: `Barang with RFID: ${rfid} not found`,
                        barang: null,
                    };
                }

                const barang = res.rows[0];
                await redisClient.set(`checkedin:${rfid}`, JSON.stringify(barang));
                console.log(`Barang checked-in successfully: ${JSON.stringify(barang)}`);

                return {
                    success: true,
                    message: 'Barang checked in successfully',
                    barang: {
                        rfid: barang.rfid,
                        namaBarang: barang.nama_barang,
                        hargaSatuan: barang.harga_satuan,
                    },
                };
            } catch (error) {
                console.error(`Error checking in barang: ${error.message}`);
                return {
                    success: false,
                    message: error.message,
                    barang: null,
                };
            }
        },
        simpanTransaksi: async (_, { transaksi }) => {
            const { qrCode, rfid, hargaSatuan, jumlah } = transaksi;
            try {
                await insertTransaksi({ qrCode, rfid, hargaSatuan, jumlah, tanggalJam: new Date() });
                await transferTransaksiToPostgres();
                return { message: 'Transaksi berhasil disimpan dan ditransfer ke Postgres.' };
            } catch (error) {
                console.error(`Error inserting or transferring transaksi: ${error.message}`);
                return { message: 'Error inserting or transferring transaksi' };
            }
        }
    }
};

module.exports = { resolvers };
