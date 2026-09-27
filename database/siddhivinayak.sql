-- ============================================================================
-- Database: siddhivinayak_db
-- Project: Siddhivinayak Tours & Travels
-- Target Engine: MySQL / MariaDB (XAMPP phpMyAdmin Compatible)
-- Character Set: utf8mb4 (Collation: utf8mb4_unicode_ci)
-- ============================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `siddhivinayak_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `siddhivinayak_db`;

-- ----------------------------------------------------------------------------
-- Table structure for `users`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `bookings`
-- ----------------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `vehicle_type` VARCHAR(100) NOT NULL,
  `pickup_location` VARCHAR(150) NOT NULL,
  `destination` VARCHAR(150) NOT NULL,
  `travel_date` DATE NOT NULL,
  `passengers` INT NOT NULL DEFAULT 1,
  `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `contact_messages`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;

CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Safe Sample Records for Testing / Presentation
-- Sample user password: "Password@123"
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `created_at`) VALUES
(1, 'Rahul Sharma', 'rahul@example.com', '9876543210', '$2y$10$wN9aWjY96BwL8Z6K1p0c4OU4ZvZfIqT4n7GqB8e6Tj7P6vB1vB2mW', NOW()),
(2, 'Priya Patel', 'priya@example.com', '9123456780', '$2y$10$wN9aWjY96BwL8Z6K1p0c4OU4ZvZfIqT4n7GqB8e6Tj7P6vB1vB2mW', NOW());

INSERT INTO `bookings` (`id`, `user_id`, `vehicle_type`, `pickup_location`, `destination`, `travel_date`, `passengers`, `status`, `created_at`) VALUES
(1, 1, 'Toyota Innova Crysta', 'Mumbai Airport (BOM)', 'Pune', '2026-10-05', 4, 'CONFIRMED', NOW()),
(2, 1, 'Mahindra Thar 4x4', 'Mumbai Dadar', 'Lonavala', '2026-10-12', 2, 'CONFIRMED', NOW()),
(3, 2, 'Mercedes Benz E-Class', 'Pune Hinjewadi', 'Goa', '2026-11-01', 3, 'PENDING', NOW());

INSERT INTO `contact_messages` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'Amit Verma', 'amit@example.com', 'Interested in a 4-day customized package for Shirdi and Nashik.', NOW()),
(2, 'Sneha Joshi', 'sneha@example.com', 'Do you provide self-drive Thar delivery directly at Mumbai domestic airport?', NOW());
