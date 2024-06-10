import express from "express";
import displayRoutes from "express-routemap";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", productsRouter);
app.use("/", cartsRouter);

app.get("/", (req, res) => {
  res.send("¡Bienvenido al ecommerce de Matías Ippoliti!");
});

app.listen(PORT, () => {
  displayRoutes(app);
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
