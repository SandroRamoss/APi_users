import { pool } from "../db.js";

export const getUsers = async (req, res) => {
  const response = await pool.query("SELECT * FROM users ORDER BY id ASC");
  res.status(200).json(response.rows);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número positivo
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "El ID debe ser un número válido" });
  }

  const numericId = parseInt(id, 10);

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [numericId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const createUser = async (req, res) => {
  const client = await pool.connect(); 
  try {
    const { nombre, correo, edad } = req.body;

    // Inicia la transacción
    await client.query("BEGIN");

    // Realiza la inserción
    const { rows } = await client.query(
      "INSERT INTO users (nombre, correo, edad) VALUES ($1, $2, $3) RETURNING *",
      [nombre, correo, edad]
    );

    // Confirma la transacción 
    await client.query("COMMIT");

    res.status(201).json(rows[0]);
  } catch (error) {
    // Revertir la transacción si hay un error
    await client.query("ROLLBACK");

    console.log(error);

    if (error?.code == "23505") {
      return res.status(409).json({ message: "Email ya existe" });
    }
    if (error?.code == "23514") {
      return res.status(409).json({ message: "La edad debe ser mayor a 0" });
    }

    return res.status(500).json({ error: error.message });
  } finally {
    // Liberar la conexión del cliente
    client.release();
  }
};


export const updateUser = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número positivo
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "El ID debe ser un número válido" });
  }

  const numericId = parseInt(id, 10);
  const { nombre, correo, edad } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE users SET nombre = $1, correo = $2, edad = $3 WHERE id = $4 RETURNING *",
      [nombre, correo, edad, numericId]
    );


    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

   
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);

    if (error?.code == "23505") {
      return res.status(409).json({ message: "Email ya existe" });
    }
    if (error?.code == "23514") {
      return res.status(409).json({ message: "La edad debe ser mayor a 0" });
    }


    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número positivo
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "El ID debe ser un número válido" });
  }

  const numericId = parseInt(id, 10);

  try {
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
      numericId,
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: `Usuario eliminado: ${numericId}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

