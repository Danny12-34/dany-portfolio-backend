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
import otherDocumentsRoutes from "./routes/otherDocumentsRoutes.js";

const app = express();

// Configure CORS to trust your live Vercel frontend and local development
const allowedOrigins = [
  "https://dany-portfolio-frontend-b8td.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/languages", languagesRoutes);
app.use("/api/references", referencesRoutes);
app.use("/api/otherdocuments", otherDocumentsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});