import express from "express";
import {
  createExperience,
  getExperience,
  updateExperience,
  deleteExperience
} from "../controllers/experienceController.js";

const router = express.Router();

router.post("/", createExperience);
router.get("/", getExperience);
router.put("/:id", updateExperience);
router.delete("/:id", deleteExperience);

export default router;