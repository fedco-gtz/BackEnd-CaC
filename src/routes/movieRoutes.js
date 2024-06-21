import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

// Ruta para obtener y renderizar productos en home.handlebars
router.get('/', async (req, res) => {
    try {
        const consulta = 'SELECT nombre, img, descripcion, aclamado FROM catalogo';
        const [rows] = await pool.query(consulta);

        const productos = rows.map(producto => ({
            nombre: producto.nombre,
            img: `../images/pages/${producto.img}`,
            descripcion: producto.descripcion,
            aclamado: producto.aclamado === 1 ? true : false,
        }));

        res.render('home', { productos });

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
            img: `../images/pages/${producto.img}`,
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
    // Aquí podrías implementar la lógica para mostrar un formulario de modificación
    // con los datos actuales del producto seleccionado
    const nombre = req.params.nombre;
    // Renderizar el formulario de modificación o realizar otra acción necesaria
    res.send(`Formulario de modificación para el producto ${nombre}`);
});

export default router;
