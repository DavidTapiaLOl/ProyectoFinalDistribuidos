const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());


const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'distribuida_db'
};


let connection;
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);
    connection.connect(function(err) {
        if(err) {
            console.log('Error conectando a BD (reintentando...):', err.code); // Log modificado para ver error
            setTimeout(handleDisconnect, 2000); 
        } else {
            console.log('Conectado a MySQL exitosamente');
        }
    });
    connection.on('error', function(err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect();
        else throw err;
    });
}
handleDisconnect();


const NET_SERVICE_URL = 'http://net-api:8080/api/email'; 




app.post('/api/register', async (req, res) => {
    const { nombre, apellidos, email, password, telefono } = req.body;
    
    
    if(!email || !password) return res.status(400).json({error: "Faltan datos"});

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const id = uuidv4();
    
        const sql = 'INSERT INTO usuarios (id, nombre, apellidos, email, password, telefono) VALUES (?, ?, ?, ?, ?, ?)';
        
        
        connection.query(sql, [id, nombre, apellidos, email, hash, telefono], (err, result) => {
            if (err) {
                console.error("Error MySQL:", err); 
                // Si el correo ya existe, MySQL devuelve código ER_DUP_ENTRY
                if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "El correo ya está registrado" });
                return res.status(500).json({ error: err.message });
            }
            
            
            console.log("Intentando contactar a .NET en:", `${NET_SERVICE_URL}/bienvenida`);
            
            axios.post(`${NET_SERVICE_URL}/bienvenida`, { email, nombre })
                 .then(() => console.log("Correo bienvenida solicitado"))
                 .catch(e => console.error("Error enviando email (.NET):", e.message));
            
            res.status(201).json({ message: "Usuario creado" });
        });
    } catch (e) {
        console.error("Error servidor:", e);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({error: err.message});
        if (results.length === 0) return res.status(401).json({msg: "Usuario no existe"});
        
        const user = results[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({msg: "Password incorrecto"});

        const token = jwt.sign({ id: user.id }, 'SECRET', { expiresIn: '1h' });
        
        connection.query('UPDATE usuarios SET fecha_ultima_sesion = NOW() WHERE id = ?', [user.id]);
        
        res.json({ token, user });
    });
});


app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    connection.query('UPDATE usuarios SET password = ? WHERE email = ?', [hash, email], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Contraseña actualizada exitosamente" });
    });
});


app.post('/api/update-profile', async (req, res) => {
    const { id, nombre, apellidos, telefono, password } = req.body;
    
    
    let sql = 'UPDATE usuarios SET nombre=?, apellidos=?, telefono=? WHERE id=?';
    let params = [nombre, apellidos, telefono, id];

    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        sql = 'UPDATE usuarios SET nombre=?, apellidos=?, telefono=?, password=? WHERE id=?';
        params = [nombre, apellidos, telefono, hash, id];
        
        
    }

    connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Datos actualizados correctamente" });
    });
});

app.listen(3000, () => console.log('Node Server running on port 3000'));