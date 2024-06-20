import express from 'express';
import pool from './src/db/db.js';

const app = express();

// Middlewares
app.use(express.static('public'));
app.use(express.json()); // Para parsear application/json

// Endpoint para obtener los productos
app.get('/api/productos', async (req, res) => {
    try {
        let filtros = req.query;
        let consulta = 'SELECT * FROM productos';
        let whereClause = '';
        let values = [];

        if (filtros.nombre) {
            whereClause += ` nombre LIKE ? AND`;
            values.push(`%${filtros.nombre}%`);
        }

        if (filtros.descripcion) {
            whereClause += ` descripcion LIKE ? AND`;
            values.push(`%${filtros.descripcion}%`);
        }

        if (filtros.precioMin) {
            whereClause += ' precio >= ? AND';
            values.push(parseInt(filtros.precioMin));
        }

        if (filtros.precioMax) {
            whereClause += ' precio <= ? AND';
            values.push(parseInt(filtros.precioMax));
        }

        if (whereClause !== '') {
            consulta += ' WHERE' + whereClause.slice(0, -4); 
        }

        if (filtros.orden) {
            consulta += ` ORDER BY precio ${filtros.orden}`;
        }

        const connection = await pool.getConnection();
        const [rows] = await connection.query(consulta, values);
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Hubo un error al obtener los productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los productos' });
    }
});

// Ruta por defecto para manejar 404
app.get('*', (req, res) => {
    res.status(404).send('404 | Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
