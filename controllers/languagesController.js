import pool from "../config/db.js";

export const createLanguage = async (req, res) => {
  const { language, proficiency } = req.body;

  const result = await pool.query(
    `INSERT INTO languages (language, proficiency)
     VALUES ($1,$2)
     RETURNING *`,
    [language, proficiency]
  );

  res.json(result.rows[0]);
};

export const getLanguages = async (req, res) => {
  const result = await pool.query("SELECT * FROM languages");
  res.json(result.rows);
};

export const updateLanguage = async (req, res) => {
  const { id } = req.params;
  const { language, proficiency } = req.body;

  const result = await pool.query(
    `UPDATE languages SET language=$1, proficiency=$2
     WHERE id=$3 RETURNING *`,
    [language, proficiency, id]
  );

  res.json(result.rows[0]);
};

export const deleteLanguage = async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM languages WHERE id=$1", [id]);

  res.json({ message: "Deleted" });
};