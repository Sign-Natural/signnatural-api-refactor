// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // make sure file is src/models/User.js

// protect middleware - require logged-in user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401);
      return res.json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      return res.json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// requireAdmin - allow only admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return res.json({ message: "Not authorized" });
  }
  if (req.user.role !== "admin") {
    res.status(403);
    return res.json({ message: "Forbidden: admin only" });
  }
  next();
};
