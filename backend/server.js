const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://your-frontend-domain.com"],
    methods: ["GET", "POST"],
  },
});

const userRouter = require("./routes/userRoutes");
const PORT = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorMiddleware");
const connectDb = require("./config/db");
const ticketRouter = require("./routes/ticketRoutes");
const analyticRoutes = require("./routes/analyticRoutes");
const logRoutes = require("./routes/logRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userNotificationRoutes = require("./routes/userNotificationRoutes"); // New import

connectDb();

app.get("/", (req, res) => {
  res.status(201).json({
    message: "Welcome to the Support Desk API",
  });
});

app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use("/api/users", userRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/analytics", analyticRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user-notifications", userNotificationRoutes); // New route for user notifications

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`Socket.IO: User disconnected: ${socket.id}`);
  });
});

app.set("socketio", io);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Socket.IO is running.");
});
