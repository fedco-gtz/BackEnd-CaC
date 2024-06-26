import express from 'express';
import { engine } from 'express-handlebars';
import movieRoutes from './src/routes/movieRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3001;

// Middleware //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Express Handlebars //
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Rutas //
app.use('/', movieRoutes);
app.use('/adminMovie', movieRoutes);
app.use('/', userRoutes);

// Servidor //
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});


