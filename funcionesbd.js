import { connectBD } from './conectbd.js';

//Funciones para la BD
export async function getRows(tabla) {
  const db = await connectBD();
  if (!db) return;
  try {
    if (tabla == 0) {
      const result = await db.query('SELECT * FROM portafolio WHERE id=$1', [1]);
      return result.rows;
    } else if (tabla == 1) {
      const result = await db.query('SELECT * FROM proyectos');
      return result.rows;
    }
  } finally {
    await db.end();
  }
}

export async function registroCorrecto(nombre, password) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql = 'SELECT * FROM administradores WHERE nombre=$1 AND password=$2';
    const result = await db.query(sql, [nombre, password]);
    return result.rows;
  } finally {
    await db.end();
  }
}

export async function insertInto(titulo, descripcion, imagen) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'INSERT INTO proyectos (titulo, descripcion, imagen) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(sql, [titulo, descripcion, imagen]);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function insertIntoSinImagen(titulo, descripcion) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'INSERT INTO proyectos (titulo, descripcion, imagen) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(sql, [titulo, descripcion, '']);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function updateProyecto(id, titulo, descripcion, imagen) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'UPDATE proyectos SET titulo = $1, descripcion = $2, imagen = $3 WHERE id = $4 RETURNING *';
    const result = await db.query(sql, [
      titulo,
      descripcion,
      imagen,
      parseInt(id),
    ]);
    console.log(result.rowCount);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function updateProyectosinImagen(id, titulo, descripcion) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'UPDATE proyectos SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *';
    const result = await db.query(sql, [titulo, descripcion, parseInt(id)]);
    console.log(result.rowCount);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function updatePortafolio(titulo, subtitulo, sobre_mi, experiencia, fondo_imagen, perfil_imagen) 
{
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'UPDATE portafolio SET titulo = $1, subtitulo = $2, sobre_mi = $3, experiencia = $4, fondo_imagen = COALESCE($5, fondo_imagen), perfil_imagen = COALESCE($6, perfil_imagen) WHERE id = $7 RETURNING *';
    const result = await db.query(sql, [titulo,subtitulo,sobre_mi,experiencia,fondo_imagen,perfil_imagen,1]);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function updatePortafolioSinImagenes(titulo, subtitulo, sobre_mi, experiencia) 
{
  const db = await connectBD();
  if (!db) return;
  try {
    const sql =
      'UPDATE portafolio SET titulo = $1, subtitulo = $2, sobre_mi = $3, experiencia = $4 WHERE id = $5 RETURNING *';
    const result = await db.query(sql, [titulo,subtitulo,sobre_mi,experiencia,1]);
    console.log(result.rowCount);
    return result.rows[0];
  } finally {
    await db.end();
  }
}

export async function deleteProyecto(id) {
  const db = await connectBD();
  if (!db) return;
  try {
    const sql = 'DELETE FROM proyectos WHERE id = $1 RETURNING *';
    const result = await db.query(sql, [parseInt(id)]);
    console.log(result.rowCount);
    return result.rows[0];
  } finally {
    await db.end();
  }
}
