import pool from "../config/db.js";

export const createSkill = async (req, res) => {
  const { category, skill_name } = req.body;

  const result = await pool.query(
    `INSERT INTO skills (category, skill_name)
     VALUES ($1,$2)
     RETURNING *`,
    [category, skill_name]
  );

  res.json(result.rows[0]);
};

export const getSkills = async (req, res) => {
  const result = await pool.query("SELECT * FROM skills");
  res.json(result.rows);
};

export const updateSkill = async (req, res) => {
  const { id } = req.params;
  const { category, skill_name } = req.body;

  const result = await pool.query(
    `UPDATE skills SET category=$1, skill_name=$2
     WHERE id=$3 RETURNING *`,
    [category, skill_name, id]
  );

  res.json(result.rows[0]);
};

export const deleteSkill = async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM skills WHERE id=$1", [id]);

  res.json({ message: "Skill deleted" });
};