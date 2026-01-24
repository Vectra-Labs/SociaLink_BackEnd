import jwt from "jsonwebtoken";
import {prisma} from "../config/db.js";

export const authMiddleware = async (req, res, next) => {

  
  console.log("HEADERS:", req.headers.authorization);
  console.log("COOKIES:", req.cookies);
  let token;

  // Bearer token 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("TOKEN FROM HEADER:", token);
  } 
  // Cookie token
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt;

    console.log("TOKEN FROM COOKIE:", token);
  }

  if (!token) {
console.log("NO TOKEN FOUND");

    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("DECODED TOKEN:", decoded);

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id },
      select: {
        user_id: true,
        email: true,
        role: true,
        email_verified: true
      },
    });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user; // { user_id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
