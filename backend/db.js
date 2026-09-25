const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // Tambahkan baris port ini
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Tambahkan blok SSL di bawah ini (wajib untuk Aiven)
    ssl: {
        rejectUnauthorized: false // Menggunakan false adalah cara paling aman agar koneksi langsung berhasil tanpa perlu mengunduh file sertifikat CA secara manual
    }
});

module.exports = pool.promise();
