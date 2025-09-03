//Imports
import express from 'express';
import multer, { diskStorage } from 'multer';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getRows, registroCorrecto, insertInto, updateProyecto, updatePortafolio, deleteProyecto, updateProyectosinImagen, updatePortafolioSinImagenes, insertIntoSinImagen } from './funcionesbd.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8081;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors()); //Se utiliza Cors para que se puedan hacer llamados a la API desde el LocalHost
//Le indicamos a app que utilize la carpeta de public
app.use(express.static(join(__dirname, 'public')));
app.use('/imagenes', express.static(join(__dirname, 'imagenes')));
app.use(express.json());

const storage = diskStorage({
    destination: (req, file, cb) => cb(null, "imagenes/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.post('/api/inicioSesion', async function(req,res){
    const { nombre, password } = req.body;
    console.log(nombre);
    await registroCorrecto(nombre, password)
    .then(async result => {
        let respuesta = true;
        console.log(result);
        if(result[0] != null) respuesta = true;
        else respuesta = false;

        res.json(respuesta);
    })
    .catch(err => res.status(500).send(err));
});

app.post('/api/modProyecto', upload.single("imagen"), async function(req,res){
    const { id, titulo, descripcion } = req.body;
    const imagen = req.file ? `/imagenes/${req.file.filename}` : null;
    if(imagen != null) await updateProyecto(id, titulo, descripcion, imagen);
    else await updateProyectosinImagen(id, titulo, descripcion);
});

app.post('/api/addProyecto', upload.single("imagen"), async function(req,res){
    const { titulo, descripcion } = req.body;
    const imagen = req.file ? `/imagenes/${req.file.filename}` : null;
    if(imagen != null) await insertInto(titulo, descripcion, imagen);
    else await insertIntoSinImagen(titulo, descripcion);
});

app.post('/api/modPortafolio', upload.fields([
    { name: "fondo", maxCount: 1 },
    { name: "perfil", maxCount: 1 }
  ]), async (req, res) => {
    const { titulo, subtitulo, sobre_mi, experiencia } = req.body;
    const fondo_imagen = req.files["fondo"] ? `/imagenes/${req.files["fondo"][0].filename}` : null;
    const perfil_imagen = req.files["perfil"] ? `/imagenes/${req.files["perfil"][0].filename}` : null;
  
    if(fondo_imagen != null && perfil_imagen!= null) await updatePortafolio(titulo, subtitulo, sobre_mi, experiencia, fondo_imagen, perfil_imagen);
    else await updatePortafolioSinImagenes(titulo, subtitulo, sobre_mi, experiencia);
});

app.post('/api/delProyecto', async function(req,res){
    const { id } = req.body; //Valores del usuario
    await deleteProyecto(id);
});

//Api que guarda los valores de todos los proyectos
app.get('/api/proyectos', async (req, res) => {
    let usu = await getRows(1);
    res.json(usu);
});

//Api que guarda los valores del portafolio
app.get('/api/portafolio', async (req, res) => {
    let usu = await getRows(0);
    res.json(usu);
});


//Iniciando el servidor
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});