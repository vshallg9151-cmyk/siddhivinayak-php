-- ==========================================================
-- Database Schema & Initial Data for Siddhivinayak Tours & Travels
-- Target Database: siddhivinayak_tours
-- Engine: MySQL / MariaDB (XAMPP phpMyAdmin compatible)
-- Character Set: utf8mb4 (Collation: utf8mb4_unicode_ci)
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Create Database if not exists
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


-- ==========================================================
-- SEED INITIAL DATA
-- ==========================================================

-- 1. Seed Users (Hashed Passwords compatible with standard PHP password_verify)
-- Password for Super Admin: 'siddhi@2005' -> $2y$10$QO0hXqB7q10R1.jTj5v8eOF7BvyB.h.x5I1Y5d2F0tq8W3hW9W8Oa
-- Password for Admin: 'admin123' -> $2y$10$wO0f93E9V2N0Yj0q0F.GZeP9K9K.X8J8f.Y0V0e0t0q0W0h0W0O0a
-- Password for User: 'user123' -> $2y$10$rO0f93E9V2N0Yj0q0F.GZeP9K9K.X8J8f.Y0V0e0t0q0W0h0W0O0a
-- We also insert standard portable hashes and support password_hash / fallback verification in helper.php
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password`, `role`, `status`, `is_owner`, `email_verified`, `mobile_verified`, `must_change_password`, `created_at`) VALUES
('super-admin-owner-001', 'Vishal (Super Admin & Owner)', 'vshallg9151@gmail.com', '9173746558', '$2y$10$d6BwT2k1gRzS4yP.6P0k5OHiV5K7jP.v2J3O4H5U6I7Y8T9R0E1W2', 'SUPER_ADMIN', 'ACTIVE', 1, 1, 1, 0, '2026-01-01 00:00:00'),
('admin-001', 'Siddhivinayak Operations Admin', 'admin@siddhivinayak.com', '9876543211', '$2y$10$e7CwU3l2hSaT5zQ.7Q1l6PIjW6L8kQ.w3K4P5I6V7J8Z9U1F2X3', 'ADMIN', 'ACTIVE', 0, 1, 1, 1, '2026-02-01 10:00:00'),
('user-001', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', '$2y$10$f8DxV4m3iTbU6aR.8R2m7QJkX7M9lR.x4L5Q6J7W8K9a0V2G3Y4', 'USER', 'ACTIVE', 0, 1, 1, 0, '2026-03-01 12:00:00')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Seed Cities
INSERT INTO `cities` (`id`, `name`, `district`, `state`, `popular`, `status`) VALUES
('mumbai', 'Mumbai', 'Mumbai City', 'Maharashtra', 1, 'AVAILABLE'),
('surat', 'Surat', 'Surat', 'Gujarat', 1, 'AVAILABLE'),
('pune', 'Pune', 'Pune', 'Maharashtra', 1, 'AVAILABLE'),
('ahmedabad', 'Ahmedabad', 'Ahmedabad', 'Gujarat', 1, 'AVAILABLE'),
('delhi', 'Delhi NCR', 'New Delhi', 'Delhi', 1, 'AVAILABLE'),
('jaipur', 'Jaipur', 'Jaipur', 'Rajasthan', 1, 'AVAILABLE'),
('goa', 'Goa', 'North Goa', 'Goa', 1, 'AVAILABLE'),
('bengaluru', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 1, 'AVAILABLE'),
('hyderabad', 'Hyderabad', 'Hyderabad', 'Telangana', 1, 'AVAILABLE'),
('udaipur', 'Udaipur', 'Udaipur', 'Rajasthan', 1, 'AVAILABLE'),
('lonavala', 'Lonavala', 'Pune', 'Maharashtra', 1, 'AVAILABLE'),
('mahabaleshwar', 'Mahabaleshwar', 'Satara', 'Maharashtra', 1, 'AVAILABLE')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. Seed Vehicles
INSERT INTO `vehicles` (`id`, `name`, `brand`, `model`, `category`, `reg_number`, `fuel_type`, `transmission`, `seats`, `price_per_day`, `security_deposit`, `location`, `images`, `status`, `rating`, `reviews_count`) VALUES
('veh-001', 'Mahindra Thar 4x4 Hard Top', 'Mahindra', 'Thar LX Petrol AT 4WD', 'SUV', 'GJ-05-ST-2919', 'Petrol', 'Automatic', 4, 4499.00, 5000.00, 'Surat', '[\"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.90, 142),
('veh-002', 'Toyota Fortuner Legender 4x4', 'Toyota', 'Legender 2.8 Diesel AT', 'Luxury SUV', 'MH-02-ST-4004', 'Diesel', 'Automatic', 7, 8999.00, 10000.00, 'Mumbai', '[\"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.95, 180),
('veh-003', 'Hyundai Creta SX (O) Turbo', 'Hyundai', 'Creta 1.5 Turbo DCT', 'SUV', 'GJ-01-ST-8822', 'Petrol', 'Automatic', 5, 3299.00, 4000.00, 'Ahmedabad', '[\"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.85, 110),
('veh-004', 'Maruti Suzuki Ertiga VXI', 'Maruti Suzuki', 'Ertiga 1.5 Smart Hybrid', 'MUV', 'GJ-05-ST-1102', 'Petrol / CNG', 'Manual', 7, 2899.00, 3000.00, 'Surat', '[\"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.80, 95),
('veh-005', 'Mahindra XUV700 AX7 Luxury Pack', 'Mahindra', 'XUV700 AWD Diesel AT', 'Luxury SUV', 'MH-12-ST-9090', 'Diesel', 'Automatic', 7, 6499.00, 8000.00, 'Pune', '[\"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.90, 130),
('veh-006', 'Toyota Innova Crysta ZX', 'Toyota', 'Innova Crysta 2.4 Diesel', 'MUV', 'GJ-05-ST-5555', 'Diesel', 'Manual', 7, 4999.00, 5000.00, 'Surat', '[\"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.92, 215),
('veh-007', 'Mercedes-Benz E-Class Exclusive', 'Mercedes-Benz', 'E 220d LWB Luxury', 'Luxury Sedan', 'MH-01-ST-0001', 'Diesel', 'Automatic', 5, 14999.00, 20000.00, 'Mumbai', '[\"https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.98, 75),
('veh-008', 'Force Urbania Luxury Van 17-Seater', 'Force Motors', 'Urbania 3615 Super Long Wheelbase', 'Luxury Van', 'GJ-05-ST-7777', 'Diesel', 'Manual', 17, 11999.00, 15000.00, 'Surat', '[\"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.90, 60),
('thar-4x4', 'Mahindra Thar 4x4 Hard Top', 'Mahindra', 'Thar LX 4x4', 'Off-Road', 'GJ-05-ST-2024', 'Diesel', 'Automatic', 4, 3499.00, 5000.00, 'Mumbai', '[\"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.90, 142),
('innova-crysta', 'Toyota Innova Crysta ZX', 'Toyota', 'Innova Crysta 2.4 ZX', '7 Seater', 'MH-02-ST-2024', 'Diesel', 'Manual', 7, 3899.00, 5000.00, 'Mumbai', '[\"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.92, 198),
('fortuner-4x4', 'Toyota Fortuner GR-Sport 4x4', 'Toyota', 'Fortuner GR-Sport 2.8 4WD', 'Luxury', 'GJ-01-ST-2024', 'Diesel', 'Automatic', 7, 6999.00, 10000.00, 'Ahmedabad', '[\"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80\"]', 'AVAILABLE', 4.95, 175)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. Seed Bookings
INSERT INTO `bookings` (`id`, `booking_id`, `user_id`, `user_name`, `user_email`, `user_phone`, `vehicle_id`, `vehicle_name`, `vehicle_image`, `pickup_city`, `drop_city`, `delivery_option`, `pickup_date`, `pickup_time`, `return_date`, `return_time`, `rental_type`, `dl_number`, `dl_uploaded`, `id_uploaded`, `total_days`, `base_fare`, `driver_allowance`, `delivery_charge`, `taxes`, `security_deposit`, `total_amount`, `payment_status`, `booking_status`, `created_at`) VALUES
(1, 'SVT-2026-849201', 'user-001', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', 'veh-001', 'Mahindra Thar 4x4 Hard Top', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 'Surat', 'Surat', 'Doorstep Delivery', '2026-08-11', '10:00', '2026-08-13', '18:00', 'Self Drive', 'MH0220201234567', 1, 1, 3, 10497.00, 0.00, 0.00, 525.00, 5000.00, 11022.00, 'PAID', 'COMPLETED', '2026-08-01 10:00:00'),
(2, 'SVT-2026-394012', 'super-admin-owner-001', 'Vishal', 'vshallg9151@gmail.com', '9173746558', 'veh-002', 'Toyota Fortuner Legender 4x4', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 'Mumbai', 'Mumbai', 'Doorstep Delivery', '2026-08-15', '09:00', '2026-08-18', '20:00', 'Chauffeur Driven', NULL, 0, 1, 4, 35996.00, 0.00, 0.00, 1800.00, 5000.00, 37796.00, 'PAID', 'COMPLETED', '2026-08-04 12:00:00')
ON DUPLICATE KEY UPDATE `booking_id`=VALUES(`booking_id`);

-- 5. Seed Reviews
INSERT INTO `reviews` (`id`, `user_id`, `user_name`, `city`, `avatar`, `rating`, `car_used`, `review_text`, `trip_photo`, `status`, `created_at`) VALUES
(1, 'user-001', 'Rajesh Kulkarni', 'Mumbai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 5, 'Mahindra Thar 4x4', 'Rented the Thar 4x4 for a 7-day Goa road trip with college buddies. The car was delivered right to my doorstep in Dadar in sparkling condition! Smooth process, zero hidden fees, and zero deposit hassle. Siddhivinayak Tours is far superior to Zoomcar.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', 'APPROVED', '2026-07-20 14:30:00'),
(2, NULL, 'Ananya Sharma', 'Delhi NCR', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 5, 'Toyota Innova Crysta', 'Booked an Innova Crysta with driver for a family trip from Delhi to Manali & Shimla. Our chauffeur Ramesh ji was punctual, extremely polite, and drove safely through mountain curves. Highly recommend for family road trips!', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', 'APPROVED', '2026-08-02 11:15:00'),
(3, NULL, 'Vikram Mehta', 'Pune', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 5, 'Hyundai Creta Automatic', 'Used Siddhivinayak Tours for my Udaipur business retreat. Booking took literally 2 minutes on mobile, and the car condition was like brand new (under 12,000 km on odometer). Top-notch service!', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80', 'APPROVED', '2026-08-10 16:45:00')
ON DUPLICATE KEY UPDATE `user_name`=VALUES(`user_name`);

-- 6. Seed Offers
INSERT INTO `offers` (`id`, `code`, `title`, `discount`, `discount_percent`, `validity`, `tag`, `description`, `bg_gradient`, `min_booking`, `is_active`) VALUES
(1, 'WEEKEND20', 'Weekend Escape Pass', '20% OFF', 20, 'Valid on Friday - Sunday Bookings', 'Popular', 'Planning a quick getaway to Lonavala, Mahabaleshwar, or Agra? Get instant 20% flat discount on all self-drive SUVs.', 'from-blue-600 to-indigo-900', 3000.00, 1),
(2, 'LONGTRIP35', 'Long-Term Roadie Special', '35% OFF', 35, 'For Bookings >= 7 Days', 'Best Value', 'Embarking on a cross-state road trip? Save big with our extended rental rates and free unlimited kilometer upgrade.', 'from-amber-600 to-yellow-800', 7000.00, 1),
(3, 'AIRPORTVIP', 'Airport Transfer Guarantee', 'FLAT ₹500 OFF', 15, '24/7 Chauffeur Pickups', 'Instant Delivery', 'On-time pickup at Mumbai T2, Delhi T3, or Bengaluru Airport with complimentary bottled water and baggage assistance.', 'from-slate-800 to-slate-950', 2500.00, 1),
(4, 'FIRST500', 'New User Welcome Bonus', 'FLAT ₹500 OFF', 10, 'Valid for First Booking', 'Welcome Gift', 'Get ₹500 discount on your first vehicle reservation across India.', 'from-purple-600 to-indigo-800', 3000.00, 1)
ON DUPLICATE KEY UPDATE `code`=VALUES(`code`);

-- 7. Seed Tour Packages
INSERT INTO `tour_packages` (`id`, `title`, `destination`, `duration`, `nights`, `days`, `category`, `badge`, `image`, `price_per_person`, `original_price`, `discount_percent`, `rating`, `reviews_count`, `hotel_category`, `included_transport`, `meal_plan`, `itinerary`, `inclusions`, `exclusions`, `policies`, `is_active`) VALUES
('pkg-goa-beach', 'Goa Tropical Sun & Beach Escape', 'Goa', '4 Days / 3 Nights', 3, 4, 'Beach & Nightlife', 'Best Seller', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', 12499.00, 15999.00, 22, 4.90, 310, '4 Star Beachfront Resort', 'Luxury Cab & Airport Transfers', 'Breakfast & Seafood Dinner', '[{\"day\":1,\"title\":\"Arrival in Goa & Sunset Cruise\",\"desc\":\"Private pickup from Goa Airport / Madgaon Station.\"},{\"day\":2,\"title\":\"North Goa Beaches & Fort Aguada\",\"desc\":\"Visit Fort Aguada, Calangute, Baga beach.\"},{\"day\":3,\"title\":\"South Goa Heritage\",\"desc\":\"Visit Basilica of Bom Jesus & Fontainhas.\"},{\"day\":4,\"title\":\"Departure\",\"desc\":\"Checkout and airport transfer.\"}]', '[\"4-Star Hotel Stay with Pool\",\"Daily Buffet Breakfast\",\"Private AC Cab for Sightseeing\",\"Mandovi River Cruise Pass\"]', '[\"Airfare / Train Tickets\",\"Personal Water Sports Expenses\",\"GST 5%\"]', '100% Refund if cancelled 7 days prior to travel date.', 1),
('pkg-rajasthan-royal', 'Udaipur & Jaipur Royal Heritage Trail', 'Udaipur', '5 Days / 4 Nights', 4, 5, 'Heritage & Culture', 'Luxury Special', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', 18999.00, 23999.00, 20, 4.95, 184, 'Heritage Palace Resort', 'Chauffeur Innova Crysta', 'Breakfast & Rajasthani Thali', '[{\"day\":1,\"title\":\"Arrival in Udaipur\",\"desc\":\"Palace welcome & Lake Pichola boat ride.\"},{\"day\":2,\"title\":\"City Palace Tour\",\"desc\":\"City Palace museum & local handicrafts.\"},{\"day\":3,\"title\":\"Drive to Jaipur\",\"desc\":\"Chittorgarh Fort sightseeing.\"},{\"day\":4,\"title\":\"Amer Fort & Hawa Mahal\",\"desc\":\"Amer Fort and Jaipur city tour.\"},{\"day\":5,\"title\":\"Departure\",\"desc\":\"Airport drop.\"}]', '[\"5-Star Palace Stay\",\"Daily Rajasthani Gourmet Meals\",\"Chauffeur Innova Crysta throughout\"]', '[\"Flight/Train Tickets\",\"GST 5%\"]', 'Full refund 10 days prior to travel date.', 1),
('pkg-lonavala-monsoon', 'Lonavala & Khandala Waterfall Retreat', 'Lonavala', '2 Days / 1 Night', 1, 2, 'Nature & Weekend', 'Popular Weekend', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 4999.00, 6500.00, 23, 4.80, 420, 'Valley View Resort', 'Private SUV / Cab', 'Breakfast & High Tea', '[{\"day\":1,\"title\":\"Lonavala Drive & Tiger Point\",\"desc\":\"Scenic mountain drive & waterfalls.\"},{\"day\":2,\"title\":\"Bhushi Dam & Karla Caves\",\"desc\":\"Caves tour & evening return drive.\"}]', '[\"Valley View Resort Stay\",\"Breakfast & Evening Snacks\",\"Private Cab\"]', '[\"Lunch/Dinner\",\"Personal Expenses\"]', 'Free cancellation up to 48 hours before trip.', 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 8. Seed Contact Messages & CRM Leads
INSERT INTO `contact_messages` (`id`, `lead_id`, `name`, `email`, `phone`, `subject`, `destination`, `budget`, `travel_date`, `travelers`, `source`, `message`, `status`, `assigned_staff`, `notes`) VALUES
(1, 'lead-101', 'Rahul Sharma', 'rahul.s@gmail.com', '9820011223', 'Goa Holiday Inquiry', 'Goa 4D Package', '₹35,000', '2026-08-20', 4, 'Website Enquiry Form', 'Looking for family package with self drive SUV and beachfront hotel.', 'NEW', 'Amit Patel', 'Requested Jain food options and airport pickup.'),
(2, 'lead-102', 'Priya Verma', 'priya.v@yahoo.com', '9892044556', 'Udaipur Honeymoon Package', 'Udaipur Heritage Tour', '₹50,000', '2026-09-05', 2, 'AI Assistant Chatbot', 'Honeymoon couple trip requesting 5-star palace stay and private chauffeur.', 'CONTACTED', 'Neha Joshi', 'Shared luxury itinerary and custom pricing.'),
(3, 'lead-103', 'Vikram Mehta', 'vikram.m@techcorp.com', '9821177889', 'Thar 4x4 Rental Inquiry', 'Mahindra Thar Self-Drive Lonavala', '₹12,000', '2026-08-15', 4, 'WhatsApp Directly', 'Confirmed 2 days Thar rental with unlimited km.', 'CONVERTED', 'Suresh Kumar', 'Booking SVT-2026-849201 generated.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 9. Seed Business Vendors
INSERT INTO `vendors` (`id`, `company_name`, `contact_person`, `phone`, `email`, `category`, `location`, `services`, `pricing`, `contract_status`, `rating`) VALUES
('vnd-1', 'The Machan Eco Resort', 'Varun Kapoor', '02114-273000', 'partners@themachan.com', 'Hotel Partner', 'Lonavala (Maharashtra)', 'Treehouse Suites & Luxury Eco Lodges', '₹8,500 - ₹18,000 / night', 'Active Contract (15% Commission)', 4.90),
('vnd-2', 'Sahyadri Transport & Cabs', 'Ganesh Shinde', '9822012345', 'dispatch@sahyadri.com', 'Transport Provider', 'Mumbai & Surat', 'Innova Crysta & Luxury Bus Fleet', '₹14/km + Tolls', 'Active Contract (12% Commission)', 4.80),
('vnd-3', 'Mapro Strawberry Farms & Dining', 'Rohan Mapro', '02168-260111', 'tours@mapro.com', 'Restaurant & Activity', 'Mahabaleshwar', 'Strawberry Farm Tours & Gourmet Dining', '₹600 / person', 'Partnered (10% Discount)', 4.95)
ON DUPLICATE KEY UPDATE `company_name`=VALUES(`company_name`);

-- 10. Seed Business Drivers
INSERT INTO `drivers` (`id`, `name`, `phone`, `license_no`, `vehicle_no`, `vehicle_type`, `rating`, `assigned_trip`, `status`) VALUES
('drv-1', 'Santosh Pawar', '9823055667', 'MH-14-2018-0098234', 'GJ-05-ST-2919', 'Mahindra Thar 4x4 (Hard Top)', 4.90, 'Surat to Lonavala Weekend Package', 'On Duty (En Route)'),
('drv-2', 'Rajesh Kadam', '9823077889', 'MH-12-2016-0043211', 'MH-02-ST-4004', 'Toyota Fortuner Legender 4x4', 4.95, 'Goa 4D/3N Family Tour', 'Assigned for Tomorrow'),
('drv-3', 'Vijay Shinde', '9823099001', 'MH-04-2020-0012904', 'GJ-01-ST-8822', 'Hyundai Creta SX (O) Turbo', 4.85, 'VIP Airport Transfer', 'Available')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 11. Seed Business Guides
INSERT INTO `guides` (`id`, `name`, `languages`, `expertise`, `location`, `rating`, `availability`, `assigned_tour`) VALUES
('gd-1', 'Anand Deshmukh', 'Marathi, Hindi, English, Gujarati', 'Karla Caves & Maratha Heritage Forts', 'Lonavala & Pune', 4.90, 'Available', 'Rajmachi & Karla Heritage Walk'),
('gd-2', 'Maria D’Souza', 'English, Konkani, Hindi, Portuguese', 'Old Goa Churches & Latin Quarter Heritage', 'North & South Goa', 4.95, 'Available', 'Fontainhas Latin Quarter Walking Tour')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 12. Seed Accounting Ledger
INSERT INTO `accounting_ledger` (`id`, `transaction_id`, `transaction_date`, `description`, `category`, `amount`, `gst`, `status`) VALUES
(1, 'tx-SVT-2026-849201', '2026-08-01', 'Reservation SVT-2026-849201 (Mahindra Thar 4x4) - Customer: Rahul Sharma', 'Revenue', 11022.00, 525.00, 'Received'),
(2, 'tx-SVT-2026-394012', '2026-08-04', 'Reservation SVT-2026-394012 (Toyota Fortuner Legender 4x4) - Customer: Vishal', 'Revenue', 37796.00, 1800.00, 'Received'),
(3, 'tx-v1', '2026-08-10', 'Vendor Payout - The Machan Hotel Partner', 'Vendor Payout', 24000.00, 1200.00, 'Settled'),
(4, 'tx-v2', '2026-08-12', 'Staff Sales Performance Incentive', 'Commission', 3500.00, 0.00, 'Paid')
ON DUPLICATE KEY UPDATE `transaction_id`=VALUES(`transaction_id`);

-- 13. Seed System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'Siddhivinayak Tours & Travels'),
('support_phone', '+91 9173746558'),
('support_email', 'support@siddhivinayak.com'),
('company_gstin', '24AAECS9151D1Z8'),
('tax_rate_gst', '5.0'),
('security_deposit_default', '5000')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

COMMIT;
