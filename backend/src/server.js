import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authenticate.js";
import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

console.log("jwt secret: ", process.env.JWT_SECRET);
console.log("database string: ", process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/tasks", authenticate, taskRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
