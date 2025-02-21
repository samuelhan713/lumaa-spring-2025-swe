import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );
    res.status(201).json({ id: result.rows[0].id, message: "User created!" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/login", async (req, res) => {
  console.log("logging in!");

  const { username, password } = req.body;

  try {
    const user = await client.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.rows[0].id },
      // "X/WdG5Iu+DuqyKG8sOy9RmMEQWTFi7E7JJh+jY+ExMs=",
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("new token on login: ", token);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
