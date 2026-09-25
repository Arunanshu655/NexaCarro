# NexaCarro

A full-stack ecommerce platform built using the MERN stack with GraphQL and Apollo Server.  
The project includes authentication, product management, cart and order handling, reviews, and a realtime buyer-seller chat system using Socket.IO.

---
## 🦥🦥🦥 [Watch Demo](https://drive.google.com/file/d/1AuXFfQ0RveVFuXqSRpBd3WfS0LVajH4x/view?usp=sharing)

---
## 🚀 Features

- User Authentication with JWT
- Role-Based Access Control (Buyer / Seller)
- Product Management
- Shopping Cart System
- Order Creation and Cancellation
- Product Reviews and Ratings
- GraphQL API using Apollo Server
- MongoDB Database with Mongoose
- Realtime Buyer-Seller Chat using Socket.IO
- Realtime Payment with Razorpay gateway

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Apollo Client
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Apollo Server
- GraphQL

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Token)
- bcrypt

### Realtime Communication
- Socket.IO

---

## 📂 Project Structure

```bash
backend/
│
├── src/
│   ├── graphql/
│   │   ├── resolvers/
│   │   ├── typeDefs/
│   │   └── schema.js
│   │
│   ├── models/
│   │
│   ├── index.js
│   │
│   └── .env
│
└── package.json
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd project-folder
```

### Install Dependencies

```bash
npm install
```

### Create `.env` File

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## ▶️ Run Server

```bash
npm run dev
```

Server will run at:

```bash
http://localhost:4000/graphql
```

---

## 📌 Core functionalities

### Authentication
- Register User
- Login User
- JWT-based Authorization

### Product System
- Add Products
- Fetch Products
- Product Details

### Cart System
- Add to Cart
- Remove from Cart
- Update Cart Quantity

### Order System
- Create Order
- View Orders
- Cancel Orders

### Review System
- Add Product Reviews
- Fetch Reviews

### Realtime Chat seller to buyer
- Create Chat
- Send Messages
- Live Message Updates using Socket.IO

---

## 🔮 Future Improvements

- AI Customer Support Chatbot
- AI Product Search Assistant
- Payment Gateway Integration
- Redis Session Management
- Docker Deployment
- AWS Deployment
- Notification System

---

## 🛠️ project status (✅ done, ⏹️ not started, 🟡 running)
### ✅ Authentication 
### ✅ Product System 
### ✅ Cart System 
### ✅ Order System
### ✅ Review System
### ✅ Styling
### ✅ Chat System
### ✅ Payment System
### 🟡 Admin management System
### ⏹️ AI System
