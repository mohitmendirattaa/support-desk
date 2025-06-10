const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); 
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Authentication Error:", error.message); // Log the actual error for debugging
      res.status(401);
      throw new Error("Not authorized, token failed"); // More specific error message
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

module.exports = protect;

/* const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      // console.log(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized");
  }
};

module.exports = protect;
 */
