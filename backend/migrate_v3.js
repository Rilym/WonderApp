const db = require('./db');

async function migrate_v3() {
    try {
        console.log("Starting Migration V3...");

        // 1. Add booking_date to carts
        try {
            await db.query('ALTER TABLE carts ADD COLUMN booking_date DATE');
            console.log("Added booking_date to carts.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("carts.booking_date already exists.");
            else throw e;
        }

        // 2. Add booking_date to order_items
        try {
            await db.query('ALTER TABLE order_items ADD COLUMN booking_date DATE');
            console.log("Added booking_date to order_items.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("order_items.booking_date already exists.");
            else throw e;
        }

        // 3. Add owner_id and images to destinations
        try {
            await db.query('ALTER TABLE destinations ADD COLUMN owner_id INT, ADD COLUMN images JSON');
            console.log("Added owner_id and images to destinations.");
            
            // Add foreign key for owner_id
            await db.query('ALTER TABLE destinations ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL');
            console.log("Added foreign key constraint for owner_id.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("destinations owner_id/images already exists.");
            else throw e;
        }

        console.log("Migration V3 complete!");
        process.exit(0);
    } catch (error) {
        console.error("Migration V3 failed:", error);
        process.exit(1);
    }
}

migrate_v3();
