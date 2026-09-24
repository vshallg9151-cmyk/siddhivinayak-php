-- ==========================================================
-- Database Schema & Initial Data for Siddhivinayak Tours & Travels
-- Target Database: siddhivinayak_tours
-- Engine: MySQL / MariaDB (XAMPP phpMyAdmin compatible)
-- Character Set: utf8mb4 (Collation: utf8mb4_unicode_ci)
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `siddhivinayak_tours` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `siddhivinayak_tours`;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
  `status` ENUM('ACTIVE', 'DISABLED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
  `is_owner` TINYINT(1) NOT NULL DEFAULT 0,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `mobile_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 0,
  `auth_token` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  UNIQUE KEY `idx_users_mobile` (`mobile`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `otp_verifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `otp_code` VARCHAR(10) NOT NULL,
  `otp_token` VARCHAR(255) DEFAULT NULL,
  `otp_type` VARCHAR(50) NOT NULL DEFAULT 'EMAIL_VERIFICATION',
  `attempts` INT NOT NULL DEFAULT 0,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_email` (`email`),
  KEY `idx_otp_token` (`otp_token`),
  KEY `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cities`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cities`;
CREATE TABLE `cities` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `popular` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('AVAILABLE', 'DISABLED') NOT NULL DEFAULT 'AVAILABLE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cities_status` (`status`),
  KEY `idx_cities_popular` (`popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `vehicles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `reg_number` VARCHAR(50) NOT NULL,
  `fuel_type` VARCHAR(50) NOT NULL,
  `transmission` VARCHAR(50) NOT NULL,
  `seats` INT NOT NULL DEFAULT 5,
  `price_per_day` DECIMAL(10,2) NOT NULL,
  `security_deposit` DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  `location` VARCHAR(100) NOT NULL DEFAULT 'Surat',
  `images` TEXT NOT NULL,
  `status` ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
  `maintenance_dates` TEXT DEFAULT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  `reviews_count` INT NOT NULL DEFAULT 120,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_vehicles_reg_number` (`reg_number`),
  KEY `idx_vehicles_status` (`status`),
  KEY `idx_vehicles_category` (`category`),
  KEY `idx_vehicles_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `bookings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `booking_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `user_email` VARCHAR(191) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `vehicle_id` VARCHAR(64) NOT NULL,
  `vehicle_name` VARCHAR(150) NOT NULL,
  `vehicle_image` TEXT DEFAULT NULL,
  `pickup_city` VARCHAR(100) NOT NULL,
  `drop_city` VARCHAR(100) NOT NULL,
  `delivery_option` VARCHAR(100) NOT NULL DEFAULT 'Doorstep Delivery',
  `pickup_date` DATE NOT NULL,
  `pickup_time` VARCHAR(20) NOT NULL DEFAULT '10:00',
  `return_date` DATE NOT NULL,
  `return_time` VARCHAR(20) NOT NULL DEFAULT '18:00',
  `rental_type` VARCHAR(50) NOT NULL DEFAULT 'Self Drive',
  `dl_number` VARCHAR(100) DEFAULT NULL,
  `dl_uploaded` TINYINT(1) NOT NULL DEFAULT 1,
  `id_uploaded` TINYINT(1) NOT NULL DEFAULT 1,
  `total_days` INT NOT NULL DEFAULT 1,
  `base_fare` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `driver_allowance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `taxes` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `security_deposit` DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('PAID', 'PENDING', 'PAY_AT_PICKUP', 'REFUNDED') NOT NULL DEFAULT 'PAID',
  `booking_status` ENUM('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS') NOT NULL DEFAULT 'CONFIRMED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_bookings_booking_id` (`booking_id`),
  KEY `idx_bookings_user_id` (`user_id`),
  KEY `idx_bookings_vehicle_id` (`vehicle_id`),
  KEY `idx_bookings_status` (`booking_status`),
  KEY `idx_bookings_pickup_date` (`pickup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `booking_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `payment_gateway` VARCHAR(50) NOT NULL DEFAULT 'UPI / Razorpay',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_booking_id` (`booking_id`),
  KEY `idx_payments_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `avatar` TEXT DEFAULT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `car_used` VARCHAR(150) NOT NULL,
  `review_text` TEXT NOT NULL,
  `trip_photo` TEXT DEFAULT NULL,
  `status` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `offers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `discount` VARCHAR(50) NOT NULL,
  `discount_percent` INT NOT NULL DEFAULT 0,
  `validity` VARCHAR(100) NOT NULL,
  `tag` VARCHAR(50) NOT NULL DEFAULT 'Popular',
  `description` TEXT NOT NULL,
  `bg_gradient` VARCHAR(100) NOT NULL DEFAULT 'from-blue-600 to-indigo-900',
  `min_booking` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_offers_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `tour_packages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tour_packages`;
CREATE TABLE `tour_packages` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `nights` INT NOT NULL DEFAULT 1,
  `days` INT NOT NULL DEFAULT 1,
  `category` VARCHAR(100) NOT NULL,
  `badge` VARCHAR(50) NOT NULL DEFAULT 'Best Seller',
  `image` TEXT NOT NULL,
  `gallery` TEXT DEFAULT NULL,
  `price_per_person` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `discount_percent` INT NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  `reviews_count` INT NOT NULL DEFAULT 100,
  `hotel_category` VARCHAR(100) DEFAULT NULL,
  `included_transport` VARCHAR(150) DEFAULT NULL,
  `meal_plan` VARCHAR(150) DEFAULT NULL,
  `itinerary` TEXT DEFAULT NULL,
  `inclusions` TEXT DEFAULT NULL,
  `exclusions` TEXT DEFAULT NULL,
  `policies` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `contact_messages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `lead_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `destination` VARCHAR(150) DEFAULT NULL,
  `budget` VARCHAR(50) DEFAULT NULL,
  `travel_date` VARCHAR(50) DEFAULT NULL,
  `travelers` INT NOT NULL DEFAULT 1,
  `source` VARCHAR(100) NOT NULL DEFAULT 'Website Enquiry Form',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `assigned_staff` VARCHAR(100) NOT NULL DEFAULT 'Amit Patel',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `vendors`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vendors`;
CREATE TABLE `vendors` (
  `id` VARCHAR(64) NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Hotel Partner',
  `location` VARCHAR(150) NOT NULL,
  `services` TEXT NOT NULL,
  `pricing` VARCHAR(100) NOT NULL,
  `contract_status` VARCHAR(100) NOT NULL DEFAULT 'Active Contract (15% Commission)',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `drivers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `license_no` VARCHAR(100) NOT NULL,
  `vehicle_no` VARCHAR(50) NOT NULL,
  `vehicle_type` VARCHAR(150) NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  `assigned_trip` VARCHAR(200) NOT NULL DEFAULT 'Available for Duty',
  `status` VARCHAR(100) NOT NULL DEFAULT 'Available',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `guides`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `guides`;
CREATE TABLE `guides` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `languages` VARCHAR(200) NOT NULL,
  `expertise` VARCHAR(200) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  `availability` VARCHAR(50) NOT NULL DEFAULT 'Available',
  `assigned_tour` VARCHAR(200) NOT NULL DEFAULT 'Heritage & Temple Tours',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `accounting_ledger`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `accounting_ledger`;
CREATE TABLE `accounting_ledger` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `transaction_id` VARCHAR(64) NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Revenue',
  `amount` DECIMAL(10,2) NOT NULL,
  `gst` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Received',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ledger_transaction_id` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `system_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password`, `role`, `status`, `is_owner`, `email_verified`, `mobile_verified`, `must_change_password`, `created_at`) VALUES
('super-admin-owner-001', 'Vishal (Super Admin & Owner)', 'vshallg9151@gmail.com', '9173746558', '$2y$10$d6BwT2k1gRzS4yP.6P0k5OHiV5K7jP.v2J3O4H5U6I7Y8T9R0E1W2', 'SUPER_ADMIN', 'ACTIVE', 1, 1, 1, 0, '2026-01-01 00:00:00'),
('admin-001', 'Siddhivinayak Operations Admin', 'admin@siddhivinayak.com', '9876543211', '$2y$10$e7CwU3l2hSaT5zQ.7Q1l6PIjW6L8kQ.w3K4P5I6V7J8Z9U1F2X3', 'ADMIN', 'ACTIVE', 0, 1, 1, 1, '2026-02-01 10:00:00'),
('user-001', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', '$2y$10$f8DxV4m3iTbU6aR.8R2m7QJkX7M9lR.x4L5Q6J7W8K9a0V2G3Y4', 'USER', 'ACTIVE', 0, 1, 1, 0, '2026-03-01 12:00:00')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

COMMIT;
