import express from "express";
import {
  createReference,
  getReferences,
  updateReference,
  deleteReference
} from "../controllers/referencesController.js";

const router = express.Router();

router.post("/", createReference);
router.get("/", getReferences);
router.put("/:id", updateReference);
router.delete("/:id", deleteReference);

export default router;