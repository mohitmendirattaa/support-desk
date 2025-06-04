const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error(
        "Authentication required. User data missing. Ensure 'protect' middleware is used."
      );
    }
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(
        `Access forbidden. Your role (${
          req.user.role || "undefined"
        }) does not have the required permissions.`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
