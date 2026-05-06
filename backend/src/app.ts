import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import institutionRoutes from "./routes/institution.routes";
import batchRoutes from "./routes/batch.routes";
import sessionRoutes from "./routes/sessions.routes";
import attendanceRoutes from "./routes/attendance.routes";
import summaryRoutes from "./routes/summary.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Assignment Management System is Live!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/institutions", institutionRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/summary", summaryRoutes);

export default app;