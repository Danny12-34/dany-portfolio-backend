import express from "express";
import multer from "multer";
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate
} from "../controllers/certificationsController.js";

const router = express.Router();

// Route-level Multer memory storage configuration (keeps binary data intact in RAM)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to safely manage larger PDF uploads
});

/**
 * READ ALL CERTIFICATES
 * GET /api/certifications
 */
router.get("/", getCertificates);

/**
 * READ SINGLE CERTIFICATE
 * GET /api/certifications/:id
 */
router.get("/:id", getCertificateById);

/**
 * CREATE CERTIFICATION
 * POST /api/certifications
 * Intercepts files (PDFs or Images) and transfers control to the controller
 */
router.post("/", upload.any(), createCertificate);

/**
 * UPDATE CERTIFICATION
 * PUT /api/certifications/:id
 * Intercepts replacement files if provided and updates metadata references
 */
router.put("/:id", upload.any(), updateCertificate);

/**
 * DELETE CERTIFICATION
 * DELETE /api/certifications/:id
 */
router.delete("/:id", deleteCertificate);

export default router;