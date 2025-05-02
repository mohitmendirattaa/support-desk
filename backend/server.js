const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();
const userRouter = require("./routes/userRoutes");
const PORT = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorMiddleware");
const connectDb = require("./config/db");

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server is running");
});
