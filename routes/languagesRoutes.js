import express from "express";
import {
  createLanguage,
  getLanguages,
  updateLanguage,
  deleteLanguage
} from "../controllers/languagesController.js";

const router = express.Router();

router.post("/", createLanguage);
router.get("/", getLanguages);
router.put("/:id", updateLanguage);
router.delete("/:id", deleteLanguage);

export default router;