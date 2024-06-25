import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

// Función para generar un ID único de 5 dígitos
const generarIdUnico = async () => {
    let id;
    let existe = true;
    while (existe) {
        id = Math.floor(10000 + Math.random() * 90000); // Genera un número de 5 dígitos
        const [rows] = await pool.query('SELECT id FROM catalogo WHERE id = ?', [id]);
        if (rows.length === 0) {
            existe = false;
        }
    }
    return id;
};

// Ruta para obtener y renderizar productos en home.handlebars
router.get('/', async (req, res) => {
    try {
        const consulta = 'SELECT id, nombre, img, descripcion, aclamado FROM catalogo';
        const [rows] = await pool.query(consulta);
        const productos = rows.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            img: `../images/pages/catalogue/${producto.img}`,
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
router.get('/adminMovie', async (req, res) => {
    try {
        const consulta = 'SELECT id, nombre, img, descripcion, aclamado FROM catalogo';
        const [rows] = await pool.query(consulta);

        const productos = rows.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            img: `../images/pages/catalogue/${producto.img}`,
            descripcion: producto.descripcion,
            aclamado: producto.aclamado === 1 ? true : false,
        }));

        res.render('adminMovie', { productos });

    } catch (error) {
        console.error('Hubo un error al obtener los productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los productos' });
    }
});

// Ruta para agregar un nuevo producto a la base de datos y mostrarlo en admin.handlebars
router.post('/adminMovie', async (req, res) => {
    const { nombre, imagen, descripcion, aclamada } = req.body;
    
    try {
        const aclamado = aclamada ? 1 : 0;
        const id = await generarIdUnico();

        const consulta = 'INSERT INTO catalogo (id, nombre, img, descripcion, aclamado) VALUES (?, ?, ?, ?, ?)';
        await pool.query(consulta, [id, nombre, imagen, descripcion, aclamado]);

        res.redirect('/adminMovie');

    } catch (error) {
        console.error('Hubo un error al agregar el producto:', error);
        res.status(500).json({ error: 'Hubo un error al agregar el producto' });
    }
});

// Ruta para eliminar un producto y sacarlo del admin.handlebars
router.post('/adminMovie/eliminar/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10); 
    console.log(`Intentando eliminar el producto con ID: ${id}`);

    try {
        const consulta = 'DELETE FROM catalogo WHERE id = ?';
        const [result] = await pool.query(consulta, [id]);

        console.log(`Número de filas afectadas: ${result.affectedRows}`); 

        if (result.affectedRows === 0) {
            console.log('No se encontró ningún producto con ese ID');
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.redirect('/adminMovie');

    } catch (error) {
        console.error('Hubo un error al eliminar el producto:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar el producto' });
    }
});

// Ruta para manejar la modificación de productos
router.get('/adminMovie/modificar/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const consulta = 'SELECT id, nombre, img, descripcion, aclamado FROM catalogo WHERE id = ?';
        const [rows] = await pool.query(consulta, [id]); 

        if (rows.length > 0) {
            const producto = rows[0]; 
            res.render('modify', { producto }); 
        } else {
            res.status(404).send('Producto no encontrado'); 
        }
    } catch (error) {
        console.error('Hubo un error al obtener el producto:', error);
        res.status(500).json({ error: 'Hubo un error al obtener el producto' });
    }
});

// Ruta para modificar un producto
router.post('/adminMovie/modificar/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nombre, img, descripcion, aclamado } = req.body;

    try {
        const consulta = 'UPDATE catalogo SET nombre = ?, img = ?, descripcion = ?, aclamado = ? WHERE id = ?';
        const valores = [nombre, img, descripcion, aclamado ? 1 : 0, id];

        await pool.query(consulta, valores);

        res.redirect('/adminMovie');
    } catch (error) {
        console.error('Hubo un error al modificar el producto:', error);
        res.status(500).json({ error: 'Hubo un error al modificar el producto' });
    }
});

// Ruta para obtener y renderizar productos en register.handlebars
router.get('/register', async (req, res) => {
    res.render('register', { isRegisterPage: true });
});

export default router;