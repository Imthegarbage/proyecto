const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware (configuraciones)
app.use(cors()); // Permite que tu HTML local hable con este servidor
app.use(express.json()); // Permite leer los datos JSON que envía el frontend

// 1. Conectar a la base de datos SQLite
// Si el archivo 'blog.db' no existe, lo crea automáticamente.
const db = new sqlite3.Database('./blog.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        crearTabla();
    }
});

// 2. Crear la tabla si no existe
function crearTabla() {
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        contenido TEXT,
        imagen TEXT,
        enlace TEXT,
        fecha TEXT
    )`);
}

// 3. RUTAS (Endpoints) - Aquí es donde el Frontend "habla" con el Backend

// OBTENER TODOS LOS POSTS (GET)
app.get('/posts', (req, res) => {
    db.all("SELECT * FROM posts ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// CREAR UN NUEVO POST (POST)
app.post('/posts', (req, res) => {
    const { titulo, contenido, imagen, enlace, fecha } = req.body;
    const sql = `INSERT INTO posts (titulo, contenido, imagen, enlace, fecha) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [titulo, contenido, imagen, enlace, fecha], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Post creado" });
    });
});

// BORRAR UN POST (DELETE)
app.delete('/posts/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM posts WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Post eliminado" });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});