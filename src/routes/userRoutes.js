import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

// Función para generar un ID único de 5 dígitos
const generarIdUnicoUser = async () => {
    let id;
    let existe = true;
    while (existe) {
        id = Math.floor(10000 + Math.random() * 90000);
        const [rows] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            existe = false;
        }
    }
    return id;
};

// Ruta para mostrar register.handlebars
router.get('/register', async (req, res) => {
    res.render('register', { isRegisterPage: true });
});

// Ruta para crear un usuario en register.handlebars
router.post('/register', async (req, res) => {
    const { nombre, apellido, email, password, fechaNacimiento, pais, terminos } = req.body;

    try {
        const id = await generarIdUnicoUser();
        const consulta = 'INSERT INTO usuarios (id, nombre, apellido, email, password, fechaNacimiento, pais, terminos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        await pool.query(consulta, [id, nombre, apellido, email, password, fechaNacimiento, pais, terminos]);

        res.render('login', { isRegisterPage: true });

    } catch (error) {
        console.error('Hubo un error al agregar el usuario:', error.message);
        res.status(500).json({ error: 'Hubo un error al agregar el usuario' });
    }
});

// Ruta para mostrar login.handlebars
router.get('/login', (req, res) => {
    res.render('login', { isRegisterPage: true });
});

// Ruta para manejar el inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const consulta = 'SELECT nombre, apellido, role_id FROM usuarios WHERE email = ? AND password = ?';
        const [resultados] = await pool.query(consulta, [email, password]);

        if (resultados.length > 0) {
            const usuario = resultados[0];
            const { nombre, apellido, role_id } = usuario;

            if (role_id === 1) {
                res.render('profileUser', { nombre, apellido });
            } else if (role_id === 2) {
                res.render('profileAdmin', { nombre, apellido });
            } else {
                res.render('login', { errorMessage: 'Rol de usuario no reconocido.', isRegisterPage: true });
            }
        } else {
            res.render('login', { errorMessage: 'Email o contraseña incorrectos.', isRegisterPage: true });
        }
    } catch (error) {
        console.error('Hubo un error al validar el usuario:', error.message);
        res.status(500).json({ error: 'Hubo un error al validar el usuario' });
    }
});

// Ruta para mostrar profileAdmin.handlebars
router.get('/profileAdmin', (req, res) => {
    res.render('profileAdmin');
});

// Ruta para obtener y renderizar usuarios en adminUser.handlebars
router.get('/adminUser', async (req, res) => {
    try {
        const consulta = `SELECT u.id, u.nombre, u.apellido, u.email, u.pais, r.nombre AS rol 
                          FROM usuarios u
                          LEFT JOIN roles r ON u.role_id = r.id`;
        const [rows] = await pool.query(consulta);

        const usuarios = rows.map(usuario => ({
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            pais: usuario.pais,
            rol: usuario.rol
        }));

        res.render('adminUser', { usuarios });

    } catch (error) {
        console.error('Hubo un error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los usuarios' });
    }
});

// Ruta para modificar el rol de los usuarios en adminUser.handlebars
router.post('/userAdmin/modifyRole/:id', async (req, res) => {
    const userId = req.params.id;
    const newRoleId = req.body.role;

    try {
        const [userRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await pool.query('UPDATE usuarios SET role_id = ? WHERE id = ?', [newRoleId, userId]);

        res.redirect('/adminUser');

    } catch (error) {
        console.error('Hubo un error al modificar el rol del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al modificar el rol del usuario' });
    }
});

// Ruta para mostrar profileUser.handlebars
router.get('/profileUser', (req, res) => {
    res.render('profileUser');
});

// Ruta para mostrar profile.handlebars
router.get('/profile', (req, res) => {
    res.render('profile');
});



export default router;