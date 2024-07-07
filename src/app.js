import express from 'express';
import displayRoutes from 'express-routemap';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/view.routes.js';

const app = express();
const PORT = 8080;

// Middleware //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Express Handlebars //
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Rutas //
app.use('/', productsRouter);
app.use('/', cartsRouter);
app.use('/', viewsRouter);

// Servidor //
const httpServer = app.listen(PORT, () => {
  displayRoutes(app)
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

import ProductManager from './utils/productManager.js';
const productManager = new ProductManager('./src/data/products.json');
const io = new Server(httpServer); 

io.on("connection", async (socket) => {
  console.log("Usuario conectado"); 

  socket.emit("products", await productManager.getProducts());

  socket.on("removeProduct", async (id) => {
      await productManager.deleteProduct(id);

      io.sockets.emit("products", await productManager.getProducts());
  })

  socket.on("addProduct", async (producto) => {
      await productManager.addProduct(producto);  

      io.sockets.emit("products", await productManager.getProducts());
  })
})