# NhaTroApp - Smart Rental Management Platform

A robust web application designed for comprehensive property lifecycle management, automated billing, and predictive asset risk analytics. This platform implements a role-based access control architecture capable of scaling to multi-building operations.

## Core Features
- Context-Aware AI Chatbot: Integrated with Google Gemini NLP. The assistant queries live MySQL database records (vacancy, pricing, rules) in real-time to provide context-accurate responses. Automatically converts and normalizes informal metrics natively.
- Predictive Anomaly Analytics: Data processing algorithm that calculates utility variance percentage by comparing current consumption against the 3-month trailing average. Automatically triggers High Severity alerts for suspected utility leaks or infrastructure failure.
- Multi-Building Management: Isolated configuration environments for different building branches, allowing dynamic utility pricing and rule sets without data cross-contamination.
- Auto PDF Contract Generation: Server-side rendering engine that generates and serves legal, dynamic rental agreements in PDF format based on tenant JSON data instantly.
- UI/UX Design System: Responsive design system built with React and TailwindCSS.

## Tech Stack
- Frontend (Client-side): ReactJS (Vite), TailwindCSS, deployed globally on Vercel.
- Backend (Server-side): Node.js, Express.js, JWT Authentication, Bcrypt Password Hashing. Deployed on Render.
- Database: Relational MySQL hosted on Aiven Cloud to ensure strong data integrity for invoices and anomalies.
- External Services: Google Gemini API (NLP processing), Cloudinary (Multipart image hosting).

## Local Development Setup

Prerequisites:
- Node.js v16 or higher
- MySQL Workbench or compatible MySQL client
- API Keys for Google AI Studio and Cloudinary

### 1. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory and configure the following variables:
```env
PORT=5000

# MySQL Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=nha_tro_app

# Security
JWT_SECRET=your_jwt_secret

# Third-party Integrations
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_URL=your_cloudinary_url
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the development server:
```bash
npm run dev
```

## Production Deployment Overview
The infrastructure isolates the frontend UI and backend API. The MySQL database is securely hosted on Aiven Cloud with IP Allowlisting targeting Render's servers. The Node.js REST API operates on Render accessing strictly hidden Environment Variables, while the statically compiled React application is distributed via Vercel.
