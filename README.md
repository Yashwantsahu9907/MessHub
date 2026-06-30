# MessHub - The Complete Mess Management Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</div>

<br />

**MessHub** is a comprehensive, production-ready MERN stack application designed to digitize and streamline the management of dining messes, hostels, and canteens. It bridges the gap between mess owners and students by providing tailored portals, bringing transparency, efficiency, and real-time analytics to meal tracking and subscription management.

---

## 🌟 Key Features

### 🧑‍🎓 Student Portal
* **QR Code Attendance:** Seamlessly log daily meals (Breakfast, Lunch, Dinner) by scanning the mess owner's dynamic QR code.
* **Meal Balance Tracking:** Keep track of active subscription plans, consumed meals, and remaining balances.
* **Billing & Payments:** View past invoices, track pending payments, and stay updated on plan expiry dates.
* **Complaint System:** Raise issues (e.g., food quality, hygiene) that are routed directly to the Super Admin for transparent resolution.

### 👨‍🍳 Mess Owner Portal
* **Member Management:** Approve or reject student join requests and manage active memberships.
* **Subscription Plans:** Create custom meal plans (e.g., 30 Days / 60 Meals) and assign them to students.
* **Payment Tracking:** Monitor pending payments and mark invoices as paid to automatically top up student meal balances.
* **Advanced Analytics:** Visualize member growth, weekly attendance trends, and revenue using interactive charts.
* **Data Export:** Export detailed attendance and financial reports as **Excel (XLSX)** or **PDF** files with a single click.

### 🛡️ Super Admin Portal
* **Global Overview:** Monitor real-time platform metrics, total active users, registered messes, and total generated revenue.
* **Platform Security:** Approve or block newly registered messes and suspend malicious user accounts.
* **Complaint Resolution:** Review and provide resolutions to student complaints directly from the dashboard.
* **Broadcast System:** Send platform-wide push notifications to all connected users instantly.
* **System Diagnostics:** Monitor server health, database connectivity, heap memory usage, and node processes.

### ⚡ Core Functionality
* **Real-Time Notifications:** Powered by WebSocket (`Socket.io`) for instant alerts on payments, join requests, and system announcements.
* **Role-Based Access Control (RBAC):** Strict JWT-based authentication preventing unauthorized access across the three distinct roles.
* **Dark Mode UI:** A gorgeous, responsive, glassmorphic UI built with Tailwind CSS, featuring full Light/Dark mode toggling.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **React.js** (via Vite)
* **Tailwind CSS** (Styling & Dark Mode)
* **React Router DOM** (Navigation)
* **Recharts** (Data Visualization)
* **Socket.io-client** (Real-time Events)
* **Lucide React** (Beautiful Icons)
* **XLSX & jsPDF** (Report Generation)

### Backend (Server)
* **Node.js & Express.js** (REST API)
* **MongoDB & Mongoose** (Database & ODM)
* **JSON Web Tokens (JWT)** (Authentication)
* **Bcrypt.js** (Password Hashing)
* **Socket.io** (WebSocket Server)
* **Security:** Helmet, Express Rate Limit, CORS

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Database (Local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Yashwantsahu9907/MessHub.git
cd MessHub
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Create a Super Admin Account
To access the Super Admin panel, run the included seeder script from the backend directory:
```bash
cd backend
npm run seed:admin
```
*(You may need to temporarily edit `backend/seed_superadmin.js` to set your desired admin email and password if not using environment variables).*

---

## 🔒 Security Implementations

* **Password Hashing:** Passwords are never stored in plain text.
* **Rate Limiting:** Protects the API against brute-force attacks.
* **HTTP Headers:** Secured using `Helmet.js` to prevent common vulnerabilities (XSS, Clickjacking).
* **Route Protection:** Backend routes verify JWT signatures and validate specific user roles before execution.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Yashwantsahu9907/MessHub/issues).

## 📄 License

This project is licensed under the MIT License.
