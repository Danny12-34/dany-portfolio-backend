import express from "express";
import multer from "multer";

import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controllers/otherDocumentsController.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

router.post("/", upload.single("file"), createDocument);

router.get("/", getDocuments);

router.get("/:id", getDocumentById);

router.put("/:id", upload.single("file"), updateDocument);

router.delete("/:id", deleteDocument);

export default router;