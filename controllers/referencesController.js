import pool from "../config/db.js";

export const createReference = async (req, res) => {
  try {
    const { names, position, phone } = req.body;

    // FIXED: Wrapped references in double quotes
    const result = await pool.query(
      `INSERT INTO "references" (names, position, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [names, position, phone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferences = async (req, res) => {
  try {
    // FIXED: Wrapped references in double quotes
    const result = await pool.query('SELECT * FROM "references"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReference = async (req, res) => {
  try {
    const { id } = req.params;
    const { names, position, phone } = req.body;

    // FIXED: Wrapped references in double quotes
    const result = await pool.query(
      `UPDATE "references" 
       SET names=$1, position=$2, phone=$3
       WHERE id=$4 RETURNING *`,
      [names, position, phone, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReference = async (req, res) => {
  try {
    const { id } = req.params;

    // FIXED: Wrapped references in double quotes
    await pool.query('DELETE FROM "references" WHERE id=$1', [id]);

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};