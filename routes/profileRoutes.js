import express from "express";
import upload from "../middleware/upload.js";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/", upload.single("image"), createProfile);
router.get("/", getProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);

export default router;