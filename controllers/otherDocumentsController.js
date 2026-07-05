import pool from "../config/db.js";
import { createClient } from "@supabase/supabase-js";

// Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const BUCKET_NAME = "otherdocuments";

/**
 * CREATE DOCUMENT
 */
export const createDocument = async (req, res) => {
  try {
    const { document_name } = req.body;

    if (!supabase) {
      throw new Error("Supabase configuration missing.");
    }

    let fileUrl = null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();

      const fileName = `uploads/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      fileUrl = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName).data.publicUrl;
    }

    const result = await pool.query(
      `INSERT INTO otherdocuments
      (document_name,file_url)
      VALUES($1,$2)
      RETURNING *`,
      [document_name, fileUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * GET ALL DOCUMENTS
 */
export const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
      FROM otherdocuments
      ORDER BY created_at DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * GET DOCUMENT BY ID
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
      FROM otherdocuments
      WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * UPDATE DOCUMENT
 */
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_name } = req.body;

    if (!supabase) {
      throw new Error("Supabase configuration missing.");
    }

    let fileUrl = null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();

      const fileName = `uploads/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      fileUrl = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName).data.publicUrl;
    } else {
      const existing = await pool.query(
        `SELECT file_url
        FROM otherdocuments
        WHERE id=$1`,
        [id]
      );

      if (existing.rows.length > 0) {
        fileUrl = existing.rows[0].file_url;
      }
    }

    const result = await pool.query(
      `UPDATE otherdocuments
      SET
      document_name=$1,
      file_url=$2
      WHERE id=$3
      RETURNING *`,
      [document_name, fileUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * DELETE DOCUMENT
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM otherdocuments
      WHERE id=$1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};