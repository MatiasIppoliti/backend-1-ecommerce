import { Router } from "express";
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();
const productsFilePath = path.resolve('./src/data/products.json');

const readProductsFromFile = async () => {
    try {
        const data = await fs.readFile(productsFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading products file:", error);
        return [];
    }
};

const writeProductsToFile = async (products) => {
    try {
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), "utf8");
        console.log("Products file updated successfully");
    } catch (error) {
        console.error("Error writing products file:", error);
    }
};

const generateId = () => {
    const id = Math.floor(10000 + Math.random() * 90000);
    return id.toString().padStart(5, '0');
};

const validateProductData = (data) => {
    const { title, description, code, status, price, stock, category, thumbnails } = data;
    if (!title || !description || !code || status === undefined || !price || !stock || !category || !thumbnails) {
        return "Todos los campos son requeridos";
    }

    if (typeof status !== 'boolean') {
        return "El campo 'status' debe ser un booleano";
    }

    if (!Array.isArray(thumbnails) || !thumbnails.every(t => typeof t === 'string')) {
        return "El campo 'thumbnails' debe ser un array de strings";
    }

    return null;
};

// Método GET para visualizar todos los productos o por ID
router.get('/api/products', async (req, res) => {
    const { limit } = req.query;
    const products = await readProductsFromFile();

    if (limit && !isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0) {
        res.json({
            message: `Mostrando ${limit} productos`,
            products: products.slice(0, parseInt(limit, 10))
        });
    } else {
        res.json({
            message: "Mostrando todos los productos",
            products
        });
    }
});

router.get('/api/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const products = await readProductsFromFile();
    const productoBuscado = products.find(producto => producto.id === pid);

    if (productoBuscado) {
        res.json(productoBuscado);
    } else {
        res.status(404).send("El producto buscado no existe");
    }
});

// Método POST para agregar un nuevo producto
router.post('/api/products', async (req, res) => {
    const error = validateProductData(req.body);
    if (error) {
        return res.status(400).send(error);
    }

    const newProduct = {
        id: generateId(),
        ...req.body
    };

    const products = await readProductsFromFile();
    products.push(newProduct);
    await writeProductsToFile(products);

    res.status(201).json({
        message: "Producto agregado exitosamente",
        product: newProduct
    });
});

// Método PUT para actualizar un producto por ID
router.put('/api/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const updateData = req.body;

    const products = await readProductsFromFile();
    const productIndex = products.findIndex(product => product.id === pid);
    if (productIndex === -1) {
        return res.status(404).send("El producto no existe");
    }

    if (updateData.id) {
        delete updateData.id;
    }

    if (updateData.status !== undefined && typeof updateData.status !== 'boolean') {
        return res.status(400).send("El campo 'status' debe ser un booleano");
    }

    if (updateData.thumbnails && (!Array.isArray(updateData.thumbnails) || !updateData.thumbnails.every(t => typeof t === 'string'))) {
        return res.status(400).send("El campo 'thumbnails' debe ser un array de strings");
    }

    const updatedProduct = { ...products[productIndex], ...updateData };
    products[productIndex] = updatedProduct;

    await writeProductsToFile(products);

    res.json({
        message: "Producto actualizado exitosamente",
        product: updatedProduct
    });
});

// Método DELETE para eliminar un producto por ID
router.delete('/api/products/:pid', async (req, res) => {
    const { pid } = req.params;

    const products = await readProductsFromFile();
    const productIndex = products.findIndex(product => product.id === pid);
    if (productIndex === -1) {
        return res.status(404).send("El producto no existe");
    }

    products.splice(productIndex, 1);
    await writeProductsToFile(products);

    res.json({
        message: "Producto eliminado exitosamente"
    });
});

export default router;
