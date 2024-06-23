import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

// Ruta para obtener y renderizar productos en home.handlebars
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const consulta = 'SELECT nombre, img, descripcion, aclamado FROM catalogo LIMIT ? OFFSET ?';
        const [rows] = await pool.query(consulta, [limit, offset]);

        const productos = rows.map(producto => ({
            nombre: producto.nombre,
            img: `../images/pages/catalogue/${producto.img}`,
            descripcion: producto.descripcion,
            aclamado: producto.aclamado === 1 ? true : false,
        }));

        const nextPage = page + 1; // Calcula la siguiente página

        res.render('home', { productos, currentPage: page, nextPage });

    } catch (error) {
        console.error('Hubo un error al obtener los productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los productos' });
    }
});


// Ruta para obtener y renderizar productos en admin.handlebars
router.get('/admin', async (req, res) => {
    try {
        const consulta = 'SELECT nombre, img, descripcion, aclamado FROM catalogo';
        const [rows] = await pool.query(consulta);

        const productos = rows.map(producto => ({
            nombre: producto.nombre,
            img: `../images/pages/catalogue/${producto.img}`,
            descripcion: producto.descripcion,
            aclamado: producto.aclamado === 1 ? true : false,
        }));

        res.render('admin', { productos });

    } catch (error) {
        console.error('Hubo un error al obtener los productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los productos' });
    }
});

// Ruta para agregar un nuevo producto a la base de datos y mostrarlo en admin.handlebars
router.post('/admin', async (req, res) => {
    const { nombre, imagen, descripcion, aclamada } = req.body;
    
    try {
        const aclamado = aclamada ? 1 : 0;

        const consulta = 'INSERT INTO catalogo (nombre, img, descripcion, aclamado) VALUES (?, ?, ?, ?)';
        await pool.query(consulta, [nombre, imagen, descripcion, aclamado]);

        res.redirect('/admin');

    } catch (error) {
        console.error('Hubo un error al agregar el producto:', error);
        res.status(500).json({ error: 'Hubo un error al agregar el producto' });
    }
});

// Ruta para eliminar un nuevo producto y sacarlo del admin.handlebars
router.post('/admin/eliminar/:nombre', async (req, res) => {
    const nombre = req.params.nombre;

    try {
        const consulta = 'DELETE FROM catalogo WHERE nombre = ?';
        await pool.query(consulta, [nombre]);

        res.redirect('/admin');

    } catch (error) {
        console.error('Hubo un error al eliminar el producto:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar el producto' });
    }
});

// Ruta para manejar la modificación de productos
router.get('/admin/modificar/:nombre', async (req, res) => {
    const nombre = req.params.nombre; // Obtiene el nombre del producto de los parámetros de la URL

    try {
        const consulta = 'SELECT nombre, img, descripcion, aclamado FROM catalogo WHERE nombre = ?';
        const [rows] = await pool.query(consulta, [nombre]); // Realiza la consulta SQL para obtener el producto por su nombre

        if (rows.length > 0) {
            const producto = rows[0]; // Si se encontró el producto, se guarda en la variable 'producto'
            res.render('modify', { producto }); // Renderiza la vista 'modify' y pasa el producto encontrado como dato
        } else {
            res.status(404).send('Producto no encontrado'); // Si no se encuentra el producto, devuelve un código de estado 404 y un mensaje
        }
    } catch (error) {
        console.error('Hubo un error al obtener el producto:', error); // Si ocurre un error al realizar la consulta SQL, se muestra en la consola
        res.status(500).json({ error: 'Hubo un error al obtener el producto' }); // Devuelve un código de estado 500 (error interno del servidor) y un mensaje JSON
    }
});

export default router;
