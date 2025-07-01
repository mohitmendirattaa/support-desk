// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel"); // <-- Correctly import your UserModel

const protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log("--> Protect middleware initiated for request.");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log(
        "--> Protect: Token extracted:",
        token ? "Exists" : "Does NOT exist"
      );

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("--> Protect: Token decoded:", decoded); // Should show { id: 'GUID', iat: ..., exp: ... }

      // Get user from the token using your UserModel.findById
      // The decoded.id should correspond to your SQL Server 'id' (GUID) column
      const user = await UserModel.findById(decoded.id);

      // IMPORTANT: Your findById function in UserModel.js already excludes the password.
      // So, you don't need .select('-password') here.
      // If your findById *did* return the password, you'd do: delete user.password;

      if (!user) {
        console.error(
          "--> Protect: User not found from decoded token ID:",
          decoded.id
        );
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      // Attach the found user (without password) to the request object
      req.user = user;
      console.log("--> Protect: User found and authorized:", req.user.email);

      console.log("--> Protect: Calling next().");
      next();
    } catch (error) {
      console.error(
        "--> Protect: Error during token verification or user lookup:",
        error.message
      );
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    console.error("--> Protect: No token in header.");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

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
