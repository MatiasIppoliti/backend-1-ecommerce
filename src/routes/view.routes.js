import { Router } from 'express';
import ProductManager from "../utils/productManager.js";
const productManager = new ProductManager("./src/data/products.json");

const router = Router();

router.get('/realtimeproducts', async(req, res) => {
    res.render('realTimeProducts');
})

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit;
        let productos = await productManager.getProducts();
        if (limit) {
            productos = productos.slice(0, limit);
        }
        res.render('home', { productos });
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

export default router;