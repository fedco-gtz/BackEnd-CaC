import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

// Ruta para obtener y renderizar productos
router.get('/', async (req, res) => {
    try {
        let nombreFiltro = req.query.nombre || '';

        // Consulta base
        let consulta = 'SELECT nombre, img FROM catalogo';
        let whereClause = '';
        let values = [];

        // Agregar filtro por nombre si existe
        if (nombreFiltro) {
            whereClause += ` nombre LIKE ?`;
            values.push(`%${nombreFiltro}%`);
        }

        // Completar la consulta si hay algún filtro
        if (whereClause !== '') {
            consulta += ' WHERE' + whereClause; 
        }

        // Obtener la conexión y ejecutar la consulta
        const connection = await pool.getConnection();
        const [rows] = await connection.query(consulta, values);
        connection.release();

        // Preparar los productos para renderizar en la vista
        const productos = rows.map(producto => ({
            nombre: producto.nombre,
            img: `../images/pages/${producto.img}`
        }));

        // Renderizar la vista home.handlebars con los productos
        res.render('home', { productos });

    } catch (error) {
        console.error('Hubo un error al obtener los productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los productos' });
    }
});

export default router;