const db = require('./db');

async function migrate() {
    try {
        console.log("Starting migration...");
        
        // Add is_active to destinations if not exists
        try {
            await db.query('ALTER TABLE destinations ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
            console.log("Added is_active to destinations.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("is_active already exists.");
            } else {
                throw e;
            }
        }

        // Create reviews table
        await db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                destination_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
            )
        `);
        console.log("Created reviews table.");
        
        console.log("Migration complete!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
