import express from "express";
import {
  createEducation,
  getEducation,
  updateEducation,
  deleteEducation
} from "../controllers/educationController.js";

const router = express.Router();

router.post("/", createEducation);
router.get("/", getEducation);
router.put("/:id", updateEducation);
router.delete("/:id", deleteEducation);

export default router;