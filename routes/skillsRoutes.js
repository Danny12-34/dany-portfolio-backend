import express from "express";
import {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill
} from "../controllers/skillsController.js";

const router = express.Router();

router.post("/", createSkill);
router.get("/", getSkills);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;