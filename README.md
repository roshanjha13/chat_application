# 💬 NexusChat — Real-time Chat Application

A production-ready real-time chat application built with **Node.js**, **Socket.IO**, **sticky-session** and **MongoDB**.

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=flat-square&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-black?style=flat-square&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Express](https://img.shields.io/badge/Express-5.x-black?style=flat-square&logo=express)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

---

## 🚀 Live Demo

🔗 [https://api-my-chat-app.onrender.com](https://api-my-chat-app.onrender.com)

---

## ✨ Features

- 💬 Real-time messaging with Socket.IO
- 🏠 Multiple chat rooms
- 👥 Online users list
- ✍️ Typing indicators
- 📜 Message history (last 50 messages)
- 🔄 Auto-reconnect on disconnect
- ⚡ Horizontal scaling with Node.js Cluster + sticky-session
- 💾 Messages saved in MongoDB
- 📱 Responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22.x |
| Framework | Express.js 5.x |
| Real-time | Socket.IO 4.x |
| Scaling | sticky-session + Node.js Cluster |
| Database | MongoDB + Mongoose |
| Frontend | Vanilla HTML/CSS/JS |
| Deployment | Render + MongoDB Atlas |

---

## 📁 Project Structure

```
chat_application/
├── server/
│   ├── cluster.js          ← Entry point (sticky-session + cluster)
│   ├── app.js              ← Express + Socket.IO logic
│   ├── db/
│   │   └── connect.js      ← MongoDB connection
│   └── models/
│       ├── Message.js      ← Message schema
│       └── Room.js         ← Room schema
├── client/
│   └── index.html          ← Full chat UI
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/roshanjha13/chat_application.git
cd chat_application
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/chatapp
WORKERS=4
```

### 4. Start the server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 🌐 How sticky-session Works

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│  Master Process (cluster.js)    │
│  Hashes client IP → same worker │
└────┬──────────┬──────────┬──────┘
     │          │          │
  Worker 1   Worker 2   Worker 3
     │          │          │
     └──────────┴──────────┘
                │
            MongoDB
```

Socket.IO polling requires every HTTP request from a client to hit the **same process**. `sticky-session` routes requests by hashing the client IP in the master process.

---

## 📡 Socket Events

| Event | Direction | Payload |
|---|---|---|
| `join` | Client → Server | `{ username, room }` |
| `message` | Both | `{ room, username, text }` |
| `history` | Server → Client | `Message[]` |
| `room:users` | Server → Client | `string[]` |
| `typing` | Both | `{ room, username, isTyping }` |

---

## 🔗 REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms/:name/messages` | Get last 50 messages |

---

## ☁️ Deployment (Render + MongoDB Atlas)

### MongoDB Atlas
1. Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. **Network Access** → Add `0.0.0.0/0`
4. **Connect** → Copy connection string

### Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo
4. Set build & start commands:

| Field | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `node server/cluster.js` |

5. Add environment variables:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
PORT=3000
WORKERS=2
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/chatapp` | MongoDB URI |
| `WORKERS` | CPU count | Number of cluster workers |

---

## 👨‍💻 Author

**Roshan Jha**
- GitHub: [@roshanjha13](https://github.com/roshanjha13)

---

## 📄 License

This project is licensed under the **ISC License**.