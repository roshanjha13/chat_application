require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const path       = require("path");
const connectDB  = require("./db/connect");
const Message    = require("./models/Message");
const Room       = require("./models/Room");

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

// REST: list rooms
app.get("/api/rooms", async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: 1 });
  res.json(rooms);
});

// REST: create room
app.post("/api/rooms", async (req, res) => {
  try {
    const room = await Room.create({ name: req.body.name, description: req.body.description });
    res.status(201).json(room);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// REST: message history for a room
app.get("/api/rooms/:name/messages", async (req, res) => {
  const msgs = await Message.find({ room: req.params.name })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(msgs.reverse());
});

// ── HTTP + Socket.IO ──────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Track online users: Map<socketId, { username, room }>
const online = new Map();

io.on("connection", (socket) => {
  const pid = process.pid;
  console.log(`[PID ${pid}] socket connected: ${socket.id}`);

  // Join room
  socket.on("join", async ({ username, room }) => {
    const prev = online.get(socket.id);
    if (prev) {
      socket.leave(prev.room);
      const sysLeave = await Message.create({
        room: prev.room, username,
        text: `${username} left the room.`, type: "system"
      });
      io.to(prev.room).emit("message", sysLeave);
      io.to(prev.room).emit("room:users", roomUsers(prev.room));
    }

    online.set(socket.id, { username, room });
    socket.join(room);

    await Room.findOneAndUpdate({ name: room }, { name: room }, { upsert: true, new: true });

    const history = await Message.find({ room }).sort({ createdAt: -1 }).limit(50).lean();
    socket.emit("history", history.reverse());

    const sysJoin = await Message.create({
      room, username,
      text: `${username} joined the room.`, type: "system"
    });
    io.to(room).emit("message", sysJoin);
    io.to(room).emit("room:users", roomUsers(room));
  });

  // Send message
  socket.on("message", async ({ room, username, text }) => {
    if (!text || !text.trim()) return;
    const msg = await Message.create({ room, username, text: text.trim() });
    io.to(room).emit("message", msg);
  });

  // Typing indicator
  socket.on("typing", ({ room, username, isTyping }) => {
    socket.to(room).emit("typing", { username, isTyping });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    const user = online.get(socket.id);
    if (user) {
      const { username, room } = user;
      online.delete(socket.id);
      const sysMsg = await Message.create({
        room, username,
        text: `${username} disconnected.`, type: "system"
      });
      io.to(room).emit("message", sysMsg);
      io.to(room).emit("room:users", roomUsers(room));
    }
    console.log(`[PID ${pid}] socket disconnected: ${socket.id}`);
  });
});

function roomUsers(room) {
  const users = [];
  for (const [, v] of online) {
    if (v.room === room) users.push(v.username);
  }
  return users;
}

module.exports = { app, server };