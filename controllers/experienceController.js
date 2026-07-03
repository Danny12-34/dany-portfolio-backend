import pool from "../config/db.js";

export const createExperience = async (req, res) => {
  const { position, organization, period, description } = req.body;

  const result = await pool.query(
    `INSERT INTO experience 
    (position, organization, period, description)
    VALUES ($1,$2,$3,$4)
    RETURNING *`,
    [position, organization, period, description]
  );

  res.json(result.rows[0]);
};

export const getExperience = async (req, res) => {
  const result = await pool.query("SELECT * FROM experience");
  res.json(result.rows);
};

export const updateExperience = async (req, res) => {
  const { id } = req.params;
  const { position, organization, period, description } = req.body;

  const result = await pool.query(
    `UPDATE experience 
     SET position=$1, organization=$2, period=$3, description=$4
     WHERE id=$5 RETURNING *`,
    [position, organization, period, description, id]
  );

  res.json(result.rows[0]);
};

export const deleteExperience = async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM experience WHERE id=$1", [id]);

  res.json({ message: "Deleted" });
};