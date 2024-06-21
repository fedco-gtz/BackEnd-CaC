import express from 'express';
import { engine } from 'express-handlebars';
import movieRoutes from './src/routes/movieRoutes.js';

const app = express();
const port = 3000;

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

// Servidor //
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
