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
        console.error('Ya existe una cuenta con el e-mail ingresado:', error.message);
        res.render('register', { error: 'Ya existe una cuenta con el e-mail ingresado', isRegisterPage: true });
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
        const consultaUsuario = 'SELECT id, nombre, apellido, genero_preferido_1, genero_preferido_2, genero_preferido_3, genero_preferido_4, genero_preferido_5, role_id FROM usuarios WHERE email = ? AND password = ?';
        const [resultadosUsuario] = await pool.query(consultaUsuario, [email, password]);

        if (resultadosUsuario.length > 0) {
            const usuario = resultadosUsuario[0];
            const { id, nombre, apellido, genero_preferido_1, genero_preferido_2, genero_preferido_3, genero_preferido_4, genero_preferido_5, role_id } = usuario;

            if (role_id === 1) {
                const generosPreferidos = [genero_preferido_1, genero_preferido_2, genero_preferido_3, genero_preferido_4, genero_preferido_5].filter(Boolean);
                const placeholders = generosPreferidos.map(() => '?').join(', ');
                const consultaGeneros = `SELECT id, nombre FROM genero_peliculas WHERE id IN (${placeholders})`;
                const [resultadosGeneros] = await pool.query(consultaGeneros, generosPreferidos);

                const nombresGenerosPreferidos = generosPreferidos.map(id => {
                    const genero = resultadosGeneros.find(g => g.id === id);
                    return genero ? genero.nombre : null;
                }).filter(Boolean).join(' | ');

                if (!nombresGenerosPreferidos) {
                    throw new Error('No se encontraron nombres para los géneros preferidos.');
                }

                const consultaCatalogo = `SELECT id, img, nombre FROM catalogo WHERE genero_id IN (${placeholders})`;
                const [resultadosCatalogo] = await pool.query(consultaCatalogo, generosPreferidos);

                res.render('profileUser', {
                    id,
                    nombre,
                    apellido,
                    nombresGenerosPreferidos,
                    peliculas: resultadosCatalogo
                });
            } else if (role_id === 2) {
                res.render('profileAdmin', { nombre, apellido });
            } else {
                res.render('login', { errorMessage: 'Rol de usuario no reconocido.', isRegisterPage: true });
            }
        } else {
            res.render('login', { error: 'E-mail o contraseña incorrecto', isRegisterPage: true });
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
router.get('/profileUser/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const consulta = 'SELECT id, nombre, apellido, genero_preferido_1, genero_preferido_2, genero_preferido_3, genero_preferido_4, genero_preferido_5 FROM usuarios WHERE id = ?';
        const [rows] = await pool.query(consulta, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const generos = [];
        const peliculasPorGenero = [];

        for (let i = 1; i <= 5; i++) {
            const generoId = rows[0][`genero_preferido_${i}`];
            if (generoId) {
                const consultaGenero = 'SELECT nombre FROM genero_peliculas WHERE id = ?';
                const [generoRows] = await pool.query(consultaGenero, [generoId]);
                if (generoRows.length > 0) {
                    generos.push(generoRows[0].nombre);

                    const consultaPeliculas = 'SELECT id, nombre, img FROM catalogo WHERE genero_id = ?';
                    const [peliculasRows] = await pool.query(consultaPeliculas, [generoId]);
                    
                    peliculasPorGenero.push({
                        genero: generoRows[0].nombre,
                        peliculas: peliculasRows
                    });
                }
            }
        }

        const generosSeparados = generos.join(' | ');

        res.render('profileUser', {
            id: rows[0].id,
            nombre: rows[0].nombre,
            apellido: rows[0].apellido,
            generos: generosSeparados,
            peliculasPorGenero: peliculasPorGenero
        });

    } catch (error) {
        console.error('Hubo un error al obtener los datos del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los datos del usuario' });
    }
});

// Ruta para mostrar profile.handlebars
router.get('/profile/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const userQuery = 'SELECT id, nombre, apellido, email, password, fechaNacimiento, pais FROM usuarios WHERE id = ?';
        const [userRows] = await pool.query(userQuery, [id]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const generosQuery = 'SELECT id, nombre FROM genero_peliculas';
        const [generos] = await pool.query(generosQuery);

        res.render('profile', {
            id: userRows[0].id,
            nombre: userRows[0].nombre,
            apellido: userRows[0].apellido,
            email: userRows[0].email,
            password: userRows[0].password,
            fechaNacimiento: userRows[0].fechaNacimiento,
            pais: userRows[0].pais,
            generos: generos
        });

    } catch (error) {
        console.error('Hubo un error al obtener los datos del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los datos del usuario' });
    }
});

// Ruta para modificar datos en profile.handlebars
router.post('/profile/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nombre, apellido, email, password, fechaNacimiento, pais, generos } = req.body;

    try {
        const generoPreferido1 = generos && generos[0] ? parseInt(generos[0], 10) : null;
        const generoPreferido2 = generos && generos[1] ? parseInt(generos[1], 10) : null;
        const generoPreferido3 = generos && generos[2] ? parseInt(generos[2], 10) : null;
        const generoPreferido4 = generos && generos[3] ? parseInt(generos[3], 10) : null;
        const generoPreferido5 = generos && generos[4] ? parseInt(generos[4], 10) : null;

        const consulta = `
            UPDATE usuarios 
            SET nombre = ?, apellido = ?, email = ?, password = ?, fechaNacimiento = ?, pais = ?,
                genero_preferido_1 = ?, genero_preferido_2 = ?, genero_preferido_3 = ?, 
                genero_preferido_4 = ?, genero_preferido_5 = ?
            WHERE id = ?`;

        await pool.query(consulta, [
            nombre, apellido, email, password, fechaNacimiento, pais,
            generoPreferido1, generoPreferido2, generoPreferido3, generoPreferido4, generoPreferido5, id
        ]);

        res.redirect(`/profile/${id}`);

    } catch (error) {
        console.error('Hubo un error al actualizar los datos del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar los datos del usuario' });
    }
});

// Ruta para eliminar en profile.handlebars
router.post('/profile/:id/delete', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const consulta = 'DELETE FROM usuarios WHERE id = ?';
        await pool.query(consulta, [id]);

        res.redirect('/');

    } catch (error) {
        console.error('Hubo un error al eliminar el perfil del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar el perfil del usuario' });
    }
});


// Ruta para mostrar profileUser.handlebars
router.get('/profile/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const consulta = 'SELECT id, nombre, apellido, genero_preferido_1, genero_preferido_2, genero_preferido_3, genero_preferido_4, genero_preferido_5 FROM usuarios WHERE id = ?';
        const [rows] = await pool.query(consulta, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const generos = [];
        const peliculasPorGenero = [];

        for (let i = 1; i <= 5; i++) {
            const generoId = rows[0][`genero_preferido_${i}`];
            if (generoId) {
                const consultaGenero = 'SELECT nombre FROM genero_peliculas WHERE id = ?';
                const [generoRows] = await pool.query(consultaGenero, [generoId]);
                if (generoRows.length > 0) {
                    generos.push(generoRows[0].nombre);

                    const consultaPeliculas = 'SELECT id, nombre, img FROM catalogo WHERE genero_id = ?';
                    const [peliculasRows] = await pool.query(consultaPeliculas, [generoId]);
                    
                    peliculasPorGenero.push({
                        genero: generoRows[0].nombre,
                        peliculas: peliculasRows
                    });
                }
            }
        }

        const generosSeparados = generos.join(' | ');

        res.render('login', {
            id: rows[0].id,
            nombre: rows[0].nombre,
            apellido: rows[0].apellido,
            generos: generosSeparados,
            peliculasPorGenero: peliculasPorGenero
        });

    } catch (error) {
        console.error('Hubo un error al obtener los datos del usuario:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los datos del usuario' });
    }
});

// Ruta para manejar la búsqueda por nombre
router.get('/buscar', async (req, res) => {
    const nombreBusqueda = req.query.nombre;
  
    try {
      const consulta = 'SELECT id, nombre, img FROM catalogo WHERE nombre = ?';
      const [rows] = await pool.query(consulta, [nombreBusqueda]);
  
      res.render('profileUser', { resultados: rows });
    } catch (error) {
      console.error('Error al ejecutar la consulta: ', error);
      res.status(500).send('Error en el servidor');
    }
  });


export default router;