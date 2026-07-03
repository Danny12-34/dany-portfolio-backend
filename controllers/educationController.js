import pool from "../config/db.js";

export const createEducation = async (req, res) => {
  const { institution, qualification, start_year, end_year } = req.body;

  const result = await pool.query(
    `INSERT INTO education 
    (institution, qualification, start_year, end_year)
    VALUES ($1,$2,$3,$4)
    RETURNING *`,
    [institution, qualification, start_year, end_year]
  );

  res.json(result.rows[0]);
};

export const getEducation = async (req, res) => {
  const result = await pool.query("SELECT * FROM education");
  res.json(result.rows);
};

export const updateEducation = async (req, res) => {
  const { id } = req.params;
  const { institution, qualification, start_year, end_year } = req.body;

  const result = await pool.query(
    `UPDATE education 
     SET institution=$1, qualification=$2, start_year=$3, end_year=$4
     WHERE id=$5 RETURNING *`,
    [institution, qualification, start_year, end_year, id]
  );

  res.json(result.rows[0]);
};

export const deleteEducation = async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM education WHERE id=$1", [id]);

  res.json({ message: "Deleted" });
};