/*
import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'peliculas',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5
});

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos conectada');
    })
    .catch(err => {
        console.error('Hubo un error al conectarse a la DB:', err);
    });
*/
// Importa los módulos necesarios
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Configura la conexión a MySQL usando las variables de entorno
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT), // Asegúrate de convertir a número si es necesario
    waitForConnections: true,
    connectionLimit: 5
});

// Conectar y verificar la conexión
pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos conectada');
    })
    .catch(err => {
        console.error('Hubo un error al conectarse a la DB:', err);
    });

export default pool;


