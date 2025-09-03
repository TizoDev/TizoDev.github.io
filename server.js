import express from 'express';
import multer, { diskStorage } from 'multer';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import {getRows, registroCorrecto, insertInto, updateProyecto,updatePortafolio, deleteProyecto, updateProyectosinImagen} from './funcionesbd.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const IMAGES_DIR = join(__dirname, 'imagenes');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

app.use('/imagenes', express.static(IMAGES_DIR));

const storage = diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function publicUrl(req, filename) {
  if (!filename) return null;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}/imagenes/${filename}`;
}

app.get('/api/proyectos', async (_req, res) => {
  try {
    const usu = await getRows(1);
    res.json(usu);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo proyectos' });
  }
});

app.get('/api/portafolio', async (_req, res) => {
  try {
    const usu = await getRows(0);
    res.json(usu);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo portafolio' });
  }
});

app.post('/api/inicioSesion', async (req, res) => {
  try {
    const { nombre, password } = req.body;
    const result = await registroCorrecto(nombre, password);
    const ok = !!(result && result[0]);
    res.json(ok);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en inicio de sesión' });
  }
});

app.post('/api/addProyecto', upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const imgUrl = req.file ? publicUrl(req, req.file.filename) : "/react.svg";
    const creado = await insertInto(titulo, descripcion, imgUrl);
    res.status(201).json({ ok: true, data: creado });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Error creando proyecto' });
  }
});

app.post('/api/modProyecto', upload.single('imagen'), async (req, res) => {
  try {
    const { id, titulo, descripcion } = req.body;
    const imgUrl = req.file ? publicUrl(req, req.file.filename) : "/react.svg";;

    const actualizado = imgUrl
      ? await updateProyecto(id, titulo, descripcion, imgUrl)
      : await updateProyectosinImagen(id, titulo, descripcion);

    res.json({ ok: true, data: actualizado });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Error modificando proyecto' });
  }
});

app.post('/api/modPortafolio', upload.fields([
  { name: 'fondo', maxCount: 1 },
  { name: 'perfil', maxCount: 1 }
]), async (req, res) => {
  try {
    const { titulo, subtitulo, sobre_mi, experiencia } = req.body;
    const updated = await updatePortafolio(
      titulo, subtitulo, sobre_mi, experiencia, '/imagenes/1756859261642.jpg', '/imagenes/1756859261652.jpg'
    );

    res.json({ ok: true, data: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Error modificando portafolio' });
  }
});

app.post('/api/delProyecto', async (req, res) => {
  console.log("BODY DEL PROYECTO:", req.body);
  try {
    const { id } = req.body;
    const eliminado = await deleteProyecto(id);
    res.json({ ok: true, data: eliminado });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Error eliminando proyecto' });
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`API escuchando en :${port}`));
