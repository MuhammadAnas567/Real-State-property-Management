🏠 Real Estate Backend API — Node.js Project

This is a backend API project developed using Node.js, designed to power a real estate platform where users can buy, sell, or rent properties. The system allows users to register, securely log in, list properties, make bookings, and communicate through live chat. It also includes advanced filtering, geo-location-based property search, and automated expiration of listings and bookings using cron jobs.

🚀 Features & Module Overview
1. User Registration

Users can create an account by providing their details. Each user record is securely stored in the database with proper validation and unique email verification.

2. Secure Login (Encrypted Authentication)

Implements JWT-based authentication with bcrypt-encrypted passwords to ensure safe and secure access for all registered users.

3. Property Listing Management

Users can add, update, or delete their property listings for sale or rent. Each property has an active/inactive status (status: true/false) and supports image uploads using Multer.

4. Booking Management

Users can send booking requests for listed properties. Each booking maintains a status (Pending, Confirmed, or Cancelled) and an expiration flag (isExpire) for automatic expiry handling.

5. Live Chat (Real-Time Communication)

Integrated with Socket.io to enable real-time chat between property owners and renters, ensuring instant communication for booking discussions or inquiries.

6. Property Filters & Search (Aggregation Pipeline)

Includes powerful MongoDB aggregation pipelines for:

Keyword search

Price filtering (Low → High, High → Low)

Property type & amenities

City-based filtering

GeoSpatial queries to find nearby properties based on latitude, longitude, and radius

7. Automated Expiry (Cron Jobs)

A Node Cron Job runs daily to automatically mark:

Expired properties (isExpire: true) after 30 days of creation

Expired bookings after the set period or check-out date

⚙️ Additional Functionalities

CRUD Operations: Full Create, Read, Update, Delete operations for Users, Properties, and Bookings.

Multer Integration: Enables image upload functionality for property listings.

Role-Based Access: Secure endpoints for Admin, Owner, and User roles using JWT Authorization.

🧩 Tech Stack

Runtime: Node.js

Database: MongoDB (Mongoose ORM)

Authentication: JWT + bcrypt

File Uploads: Multer

Real-Time Communication: Socket.io

Task Scheduler: Node Cron

Geo Queries: MongoDB GeoSpatial

🗂️ Project Modules Summary
Module	Description
Register	Allows new users to sign up and create an account with proper validation.
Secure Login	Provides user authentication with JWT and encrypted password storage.
Property Listing Status	Manages active/inactive property listings with CRUD functionality.
Booking Status	Tracks booking progress (Pending, Confirmed, Cancelled) and expiration.
Live Chat	Enables real-time communication between users using Socket.io.
Property Filters	Provides advanced filtering and searching via aggregation pipelines and geo queries.
Cron Job (Auto Expiry)	Automatically updates expired listings and bookings after 30 days.
🧠 Summary

This project demonstrates the development of a scalable and secure REST API for a real estate platform, focusing on real-time interactivity, geo-based property search, data security, and automated system maintenance.