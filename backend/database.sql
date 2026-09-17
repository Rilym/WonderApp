-- ============================================
-- WanderApp - Complete Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS wisata_db;
USE wisata_db;

-- Users table (supports 4 roles: user, admin, superadmin, owner)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','superadmin','owner') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Destinations table
CREATE TABLE IF NOT EXISTS `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `owner_id` int DEFAULT NULL,
  `images` json DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_owner` (`owner_id`),
  CONSTRAINT `fk_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Shopping Cart
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `destination_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `booking_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `destination_id` (`destination_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Order Items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `destination_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `booking_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `destination_id` (`destination_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `destination_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `destination_id` (`destination_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Demo Seeder Data
-- ============================================

-- Superadmin account (password: admin123)
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Super Admin', 'admin@wanderapp.com', '$2a$10$XOPbrlUPQdwdJUpSrljMkOG3Z.Z3SaK7YBkSqL5Oy.gYpWx5Hq2Uy', 'superadmin');

-- Sample destinations
INSERT INTO `destinations` (`name`, `description`, `price`, `category`, `location`, `image_url`, `images`, `owner_id`, `stock`, `latitude`, `longitude`) VALUES
('Bali Safari Marine Park', 'Experience the best safari park in Bali with hundreds of amazing animals in their natural habitats. Perfect for a family getaway.', 750000.00, 'Nature', 'Gianyar, Bali', 'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=1920&q=80', '["https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=1920&q=80"]', 1, 50, -8.58361100, 115.31166700),
('Mount Bromo Sunrise Tour', 'Witness the breathtaking sunrise over the active Mount Bromo volcano. An unforgettable adventure in East Java.', 1200000.00, 'Mountain', 'Probolinggo, East Java', 'https://images.unsplash.com/photo-1588693892701-d8ecb09e1e94?w=1920&q=80', '["https://images.unsplash.com/photo-1588693892701-d8ecb09e1e94?w=1920&q=80"]', 1, 20, -7.94250000, 112.95300000),
('Borobudur Temple Exploration', 'Discover the majesty of the worlds largest Buddhist temple. Rich in history and stunning architecture.', 350000.00, 'Historical', 'Magelang, Central Java', 'https://images.unsplash.com/photo-1574697332766-3d238b16c808?w=1920&q=80', '["https://images.unsplash.com/photo-1574697332766-3d238b16c808?w=1920&q=80"]', 1, 100, -7.60780000, 110.20370000),
('Raja Ampat Diving Trip', 'Dive into the pristine waters of Raja Ampat and explore the most diverse marine life on the planet.', 4500000.00, 'Beach', 'West Papua', 'https://images.unsplash.com/photo-1498144846853-60ca2d43853b?w=1920&q=80', '["https://images.unsplash.com/photo-1498144846853-60ca2d43853b?w=1920&q=80"]', 1, 15, -0.54670000, 130.14580000);
