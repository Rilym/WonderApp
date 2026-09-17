const db = require('./db');

async function seed() {
    try {
        const [users] = await db.query('SELECT id FROM users LIMIT 1');
        const ownerId = users.length > 0 ? users[0].id : 1; 

        const dests = [
            { 
                name: 'Bali Safari Marine Park', 
                description: 'Experience the best safari park in Bali with hundreds of amazing animals in their natural habitats. Perfect for a family getaway.', 
                price: 750000, 
                category: 'Nature', 
                location: 'Gianyar, Bali', 
                image_url: 'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 
                images: JSON.stringify(['https://images.unsplash.com/photo-1534759846116-5799c33ce22a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 'https://images.unsplash.com/photo-1588693892701-d8ecb09e1e94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80']), 
                stock: 50 
            },
            { 
                name: 'Mount Bromo Sunrise Tour', 
                description: 'Witness the breathtaking sunrise over the active Mount Bromo volcano. An unforgettable adventure in East Java.', 
                price: 1200000, 
                category: 'Mountain', 
                location: 'Probolinggo, East Java', 
                image_url: 'https://images.unsplash.com/photo-1588693892701-d8ecb09e1e94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 
                images: JSON.stringify(['https://images.unsplash.com/photo-1588693892701-d8ecb09e1e94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80']), 
                stock: 20 
            },
            { 
                name: 'Borobudur Temple Exploration', 
                description: 'Discover the majesty of the world\'s largest Buddhist temple. Rich in history and stunning architecture.', 
                price: 350000, 
                category: 'Historical', 
                location: 'Magelang, Central Java', 
                image_url: 'https://images.unsplash.com/photo-1574697332766-3d238b16c808?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 
                images: JSON.stringify(['https://images.unsplash.com/photo-1574697332766-3d238b16c808?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80']), 
                stock: 100 
            },
            { 
                name: 'Raja Ampat Diving Trip', 
                description: 'Dive into the pristine waters of Raja Ampat and explore the most diverse marine life on the planet.', 
                price: 4500000, 
                category: 'Beach', 
                location: 'West Papua', 
                image_url: 'https://images.unsplash.com/photo-1498144846853-60ca2d43853b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 
                images: JSON.stringify(['https://images.unsplash.com/photo-1498144846853-60ca2d43853b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80']), 
                stock: 15 
            }
        ];

        for (let d of dests) {
            await db.query(
                'INSERT INTO destinations (name, description, price, category, location, image_url, images, owner_id, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
                [d.name, d.description, d.price, d.category, d.location, d.image_url, d.images, ownerId, d.stock]
            );
        }
        console.log("Inserted destinations successfully");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

seed();
