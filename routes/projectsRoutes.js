import express from "express";
import multer from "multer";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectsController.js";

const router = express.Router();

// 1. Configure Multer to intercept files into RAM memory buffers
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit per file
});

// 2. Handle paths and intercept files on POST/PUT actions
router.get("/", getProjects);
router.post("/", upload.any(), createProject); 
router.put("/:id", upload.any(), updateProject);
router.delete("/:id", deleteProject);

export default router;