import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: '127.0.0.1',
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

export default pool;
