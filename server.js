// server.js

// This specific syntax forces dotenv to load BEFORE any other imports are processed
import 'dotenv/config'; 

import express from "express";
import cors from "cors";

import profileRoutes from "./routes/profileRoutes.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import certificationsRoutes from "./routes/certificationsRoutes.js";
import languagesRoutes from "./routes/languagesRoutes.js";
import referencesRoutes from "./routes/referencesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/languages", languagesRoutes);
app.use("/api/references", referencesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});