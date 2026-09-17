const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('Connecting to MySQL without specific DB...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
        
        console.log('Executing database schema script...');
        await connection.query(sql);
        console.log('Database and tables created successfully!');
        
        await connection.end();
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase();
