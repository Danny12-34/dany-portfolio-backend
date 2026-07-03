import pool from "../config/db.js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with your explicit .env variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const BUCKET_NAME = "certificates";

/**
 * Helper function to safely parse file/image URLs coming from the database.
 * Handles Native Arrays, Stringified JSON, or fallback arrays safely.
 */
const parseImageUrls = (imageUrls) => {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls;

  try {
    if (typeof imageUrls === "string") {
      const parsed = JSON.parse(imageUrls);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return [imageUrls];
  } catch (e) {
    console.error("⚠️ Error parsing image_urls column in certifications:", e.message);
    return [];
  }
};

/**
 * CREATE CERTIFICATE (Post files to Bucket -> Save references to DB)
 */
export const createCertificate = async (req, res) => {
  try {
    const { title, organization, certificate_url } = req.body;
    let uploadedUrls = [];

    if (!supabase) {
      throw new Error("Supabase client is missing configurations in your backend .env file.");
    }

    // Process files (PDFs or Images) sent from the frontend client
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        // Stream file binary up into your Supabase 'certificates' bucket
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype, // Preserves file format (e.g., application/pdf)
            upsert: false
          });

        if (error) throw error;

        // Extract public link from storage
        return supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName).data.publicUrl;
      });

      uploadedUrls = await Promise.all(uploadPromises);
    }

    // Save metadata paths inside PostgreSQL
    const result = await pool.query(
      `INSERT INTO certifications 
      (title, organization, certificate_url, image_urls)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        title,
        organization,
        certificate_url || null,
        JSON.stringify(uploadedUrls)
      ]
    );

    const certification = result.rows[0];
    if (certification) {
      certification.image_urls = parseImageUrls(certification.image_urls);
    }

    return res.status(201).json(certification);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN createCertificate:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET ALL CERTIFICATES
 */
export const getCertificates = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, organization, certificate_url, image_urls, created_at FROM certifications ORDER BY created_at DESC NULLS LAST"
    );

    // Standardize file arrays so the frontend always receives clean JS Arrays
    const standardizedCertificates = (result.rows || []).map((row) => ({
      ...row,
      image_urls: parseImageUrls(row.image_urls)
    }));

    return res.status(200).json(standardizedCertificates);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN getCertificates:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

/**
 * GET SINGLE CERTIFICATE BY ID
 */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM certifications WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const certification = result.rows[0];
    certification.image_urls = parseImageUrls(certification.image_urls);

    return res.status(200).json(certification);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN getCertificateById:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE CERTIFICATE
 */
export const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, organization, certificate_url } = req.body;
    let finalUrls = [];

    if (!supabase) {
      throw new Error("Supabase client is missing configurations in your backend .env file.");
    }

    // If new files are uploaded -> Process them and replace old files
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

        if (error) throw error;

        return supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName).data.publicUrl;
      });

      finalUrls = await Promise.all(uploadPromises);
    } else {
      // Fallback: Retain original files if no new documents are provided
      const existing = await pool.query(
        "SELECT image_urls FROM certifications WHERE id = $1",
        [id]
      );
      if (existing.rows.length > 0) {
        finalUrls = parseImageUrls(existing.rows[0].image_urls);
      }
    }

    const result = await pool.query(
      `UPDATE certifications SET
        title = $1,
        organization = $2,
        certificate_url = $3,
        image_urls = $4
      WHERE id = $5
      RETURNING *`,
      [
        title,
        organization,
        certificate_url || null,
        JSON.stringify(finalUrls),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found to update" });
    }

    const updatedCertificate = result.rows[0];
    updatedCertificate.image_urls = parseImageUrls(updatedCertificate.image_urls);

    return res.status(200).json(updatedCertificate);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN updateCertificate:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE CERTIFICATE
 */
export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM certifications WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found to delete" });
    }

    return res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN deleteCertificate:", err);
    return res.status(500).json({ error: err.message });
  }
};