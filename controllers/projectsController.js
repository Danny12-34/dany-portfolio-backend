import pool from "../config/db.js";
import { createClient } from "@supabase/supabase-js";

// Match the exact variable names from your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error("🔴 CRITICAL CONFIG ERROR: SUPABASE_URL or SUPABASE_KEY is missing from your .env file!");
}

// Initialize the Supabase client safely
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const BUCKET_NAME = "projectscreenshoot";

/**
 * Helper function to safely parse image URLs coming from the database.
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
    console.error("⚠️ Error parsing image_urls column:", e.message);
    return [];
  }
};

/**
 * GET ALL PROJECTS
 */
export const getProjects = async (req, res) => {
  try {
    let result;
    try {
      result = await pool.query(
        "SELECT * FROM projects ORDER BY created_at DESC NULLS LAST"
      );
    } catch (sqlErr) {
      console.warn("⚠️ 'created_at' column missing, falling back to unordered select.");
      result = await pool.query("SELECT * FROM projects");
    }

    const standardizedProjects = (result.rows || []).map((row) => ({
      ...row,
      image_urls: parseImageUrls(row.image_urls)
    }));

    return res.status(200).json(standardizedProjects);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN getProjects:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

/**
 * CREATE PROJECT
 */
export const createProject = async (req, res) => {
  try {
    const { title, technologies, description, github_url, live_url } = req.body;
    let urls = [];

    if (!supabase) {
      throw new Error("Supabase storage client is not configured properly.");
    }

    // Process files and stream straight into the 'projectscreenshoot' bucket
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) throw error;

        // Retrieve the clean public web URL from your bucket
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      });

      urls = await Promise.all(uploadPromises);
    }

    const result = await pool.query(
      `INSERT INTO projects 
      (title, technologies, description, github_url, live_url, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        title,
        technologies,
        description,
        github_url || null,
        live_url || null,
        JSON.stringify(urls)
      ]
    );

    const project = result.rows[0];
    if (project) {
      project.image_urls = parseImageUrls(project.image_urls);
    }

    return res.status(201).json(project);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN createProject:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET SINGLE PROJECT
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = result.rows[0];
    project.image_urls = parseImageUrls(project.image_urls);

    return res.status(200).json(project);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN getProjectById:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE PROJECT
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, technologies, description, github_url, live_url } = req.body;
    let urls = [];

    if (!supabase) {
      throw new Error("Supabase storage client is not configured properly.");
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) throw error;

        return supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName).data.publicUrl;
      });

      urls = await Promise.all(uploadPromises);
    } else {
      const existing = await pool.query(
        "SELECT image_urls FROM projects WHERE id = $1",
        [id]
      );
      if (existing.rows.length > 0) {
        urls = parseImageUrls(existing.rows[0].image_urls);
      }
    }

    const result = await pool.query(
      `UPDATE projects SET
        title = $1,
        technologies = $2,
        description = $3,
        github_url = $4,
        live_url = $5,
        image_urls = $6
      WHERE id = $7
      RETURNING *`,
      [
        title,
        technologies,
        description,
        github_url || null,
        live_url || null,
        JSON.stringify(urls),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found to update" });
    }

    const updatedProject = result.rows[0];
    updatedProject.image_urls = parseImageUrls(updatedProject.image_urls);

    return res.status(200).json(updatedProject);
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN updateProject:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE PROJECT
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found to delete" });
    }
    
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("🔴 CRITICAL BACKEND ERROR IN deleteProject:", err);
    return res.status(500).json({ error: err.message });
  }
};