import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(
    token,
    // "X/WdG5Iu+DuqyKG8sOy9RmMEQWTFi7E7JJh+jY+ExMs=",
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.userId = decoded.id;
      next();
    }
  );
}
