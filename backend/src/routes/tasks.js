import express from "express";
import client from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tasks = await client.query("SELECT * FROM tasks WHERE user_id = $1", [
      req.userId,
    ]);
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req, res) => {
  const { title, description } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error: ", err });
  }
});

router.put("/:id", async (req, res) => {
  const { title, description, is_complete } = req.body;

  if (
    title === undefined ||
    description === undefined ||
    is_complete === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await client.query(
      "UPDATE tasks SET title = $1, description = $2, is_complete = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, description, is_complete, req.params.id, req.userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Task not found or not authorized to update" });
    }

    res.json({ message: "Task updated", task: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await client.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
