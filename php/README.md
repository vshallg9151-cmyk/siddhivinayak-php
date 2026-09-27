# Siddhivinayak Tours & Travels — Native PHP & MySQL Backend

A clean, native **PHP 8+ and MySQL** backend architecture created for academic evaluation, project presentation, and viva demonstration.

---

## 1. Project Directory Structure

```text
C:/xampp/htdocs/siddhivinayak/
│
├── php/
│   ├── config/
│   │   └── database.php         # Central PDO database connection & JSON helpers
│   ├── api/
│   │   ├── health.php           # Server & database health status API (GET)
│   │   ├── register.php         # User registration with password hashing (POST)
│   │   ├── login.php            # User authentication with password_verify (POST)
│   │   ├── create_booking.php   # Insert new vehicle/tour booking (POST)
│   │   ├── get_bookings.php     # Retrieve bookings (all or by user_id) (GET)
│   │   ├── cancel_booking.php   # Update booking status to CANCELLED (POST)
│   │   └── contact.php          # Contact & enquiry form submission (POST)
│   └── README.md                # Complete academic setup and testing guide
│
└── database/
    └── siddhivinayak.sql        # MySQL database schema, tables & sample data
```

---

## 2. Step-by-Step Setup Guide in XAMPP

1. **Start XAMPP Services:**
   * Open the **XAMPP Control Panel**.
   * Click **Start** for **Apache** (runs on port `80` or `8080`).
   * Click **Start** for **MySQL** (runs on port `3306`).

2. **Project Location Verification:**
   * Confirm the project folder is placed in your XAMPP web root:
     `C:/xampp/htdocs/siddhivinayak/`

3. **Import Database in phpMyAdmin:**
   * Open your browser and navigate to:  
     `http://localhost/phpmyadmin/`
   * Click on the **Import** tab at the top.
   * Click **Choose File** and select:  
     `C:/xampp/htdocs/siddhivinayak/database/siddhivinayak.sql`
   * Scroll down and click **Import** (or **Go**).
   * This automatically creates the `siddhivinayak_db` database with 3 tables: `users`, `bookings`, and `contact_messages`.

4. **Verify Health Endpoint:**
   * Open in browser:  
     `http://localhost/siddhivinayak/php/api/health.php`
   * If both Apache and MySQL are running, you will see `database: "connected"`.

---

## 3. How Each PHP File Works (Viva Guide)

### 1. `php/config/database.php`
* **Purpose:** Acts as the single source of truth for database connectivity.
* **Key Concepts:**
  * Uses modern **PDO (PHP Data Objects)** with `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` for robust error handling.
  * Configured with default XAMPP credentials (`host=localhost`, `user=root`, empty password, `dbname=siddhivinayak_db`).
  * Includes `getRequestData()` to automatically support both raw JSON payloads (`fetch`/`axios`) and traditional form data (`$_POST`).
  * Provides `sendJsonResponse()` for standardized HTTP headers and JSON encoding.

### 2. `php/api/health.php`
* **Method:** `GET`
* **Purpose:** Diagnostics endpoint that verifies PHP runtime status and pings MySQL with `SELECT DATABASE()`.
* **Sample URL:** `http://localhost/siddhivinayak/php/api/health.php`

### 3. `php/api/register.php`
* **Method:** `POST`
* **Purpose:** Validates input fields, checks for duplicate email, hashes passwords via native `password_hash($password, PASSWORD_BCRYPT)`, and inserts user with prepared statements.

### 4. `php/api/login.php`
* **Method:** `POST`
* **Purpose:** Queries the user record using a prepared statement and verifies the credentials using `password_verify($password, $user['password'])`. Returns sanitized user details without the hash.

### 5. `php/api/create_booking.php`
* **Method:** `POST`
* **Purpose:** Validates customer existence, pickup/destination, vehicle type, and date, then inserts a booking linked via foreign key (`user_id`).

### 6. `php/api/get_bookings.php`
* **Method:** `GET`
* **Purpose:** Uses an `INNER JOIN` between `bookings` and `users` to fetch rich booking details. Supports filtering via `?user_id=1` or returning all records when omitted.

### 7. `php/api/cancel_booking.php`
* **Method:** `POST`
* **Purpose:** Verifies that the specified `booking_id` exists and safely updates its status column to `CANCELLED`.

### 8. `php/api/contact.php`
* **Method:** `POST`
* **Purpose:** Validates customer name, email, and message, then stores the enquiry in `contact_messages`.

---

## 4. API Endpoints Reference & Payloads

| Endpoint | Method | Purpose | Sample Request Body |
| :--- | :---: | :--- | :--- |
| `/php/api/health.php` | `GET` | System health check | *None* |
| `/php/api/register.php` | `POST` | User registration | `{"name":"Karan Mehta","email":"karan@example.com","phone":"9988776655","password":"Secret@123"}` |
| `/php/api/login.php` | `POST` | User login | `{"email":"rahul@example.com","password":"Password@123"}` |
| `/php/api/create_booking.php` | `POST` | Create booking | `{"user_id":1,"vehicle_type":"Mahindra Thar 4x4","pickup_location":"Mumbai","destination":"Goa","travel_date":"2026-10-15","passengers":2}` |
| `/php/api/get_bookings.php` | `GET` | Get all bookings | *None (Optional: `?user_id=1`)* |
| `/php/api/cancel_booking.php` | `POST` | Cancel booking | `{"booking_id":1}` |
| `/php/api/contact.php` | `POST` | Submit enquiry | `{"name":"Aarav Shah","email":"aarav@example.com","message":"Need 7-seater Innova for 3 days."}` |

---

## 5. Security Principles Implemented

* **Prepared Statements (`PDO::prepare`):** 100% protection against SQL Injection.
* **Native BCRYPT Hashing:** Plain-text passwords are never saved.
* **HTTP Status Codes:** Proper status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `405 Method Not Allowed`, `409 Conflict`, `500 Server Error`).
* **Input Validation & Sanitization:** Verifies data types, minimum lengths, and email formats.
