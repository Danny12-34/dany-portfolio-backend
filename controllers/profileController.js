import pool from "../config/db.js";
import { uploadToStorage } from "../helpers/uploadToStorage.js";

export const createProfile = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToStorage(req.file, "profile");
    }

    // Extracted all fields coming from the client React ProfileForm
    const { name, title, bio, headline, objective, email, phone, location, github, linkedin } = req.body;

    // Escaped table name: "profile" - dynamically capturing all infrastructure attributes
    const result = await pool.query(
      `INSERT INTO "profile" 
      (name, title, bio, headline, objective, email, phone, location, github, linkedin, profile_image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [name, title, bio, headline, objective, email, phone, location, github, linkedin, imageUrl]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    // Escaped table name: "profile"
    const result = await pool.query('SELECT * FROM "profile"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, bio, headline, objective, email, phone, location, github, linkedin } = req.body;

    // Check if a new file asset is uploaded during the modification request
    let queryFields = `SET name=$1, title=$2, bio=$3, headline=$4, objective=$5, email=$6, phone=$7, location=$8, github=$9, linkedin=$10`;
    let queryParams = [name, title, bio, headline, objective, email, phone, location, github, linkedin, id];

    if (req.file) {
      const imageUrl = await uploadToStorage(req.file, "profile");
      queryFields += `, profile_image_url=$11`;
      // Insert image link right before the target ID placement parameter
      queryParams.splice(10, 0, imageUrl); 
    }

    // Dynamically targeting matching index positions safely using positional notation
    const result = await pool.query(
      `UPDATE "profile" 
       ${queryFields}
       WHERE id=$${queryParams.length}
       RETURNING *`,
      queryParams
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Escaped table name: "profile"
    await pool.query('DELETE FROM "profile" WHERE id=$1', [id]);

    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};