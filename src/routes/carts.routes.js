import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

const cartsFilePath = path.resolve('./src/data/cart.json');

let carts = [];
let cartIdCounter = 1;

const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    } else {
      throw err;
    }
  }
};

const writeFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const initializeData = async () => {
  carts = await readFile(cartsFilePath);
  cartIdCounter = carts.length > 0 ? Math.max(...carts.map(cart => cart.id)) + 1 : 1;
};

initializeData();

// función reusable para encontrar un carrito por ID
const findCartById = (id) => carts.find(cart => cart.id === parseInt(id));

// función reusable para encontrar un producto en un carrito
const findProductInCart = (cart, productId) => cart.products.find(product => product.id === parseInt(productId));

// Método GET para visualizar el carrito de compras
router.get('/api/carts', (req, res) => {
  res.json({
    message: carts.length === 0 ? "El carrito está vacío" : "Mostrando el carrito de compras",
    carts
  });
});

// Método GET para visualizar los productos del carrito por ID
router.get('/api/carts/:cid', (req, res) => {
  const cart = findCartById(req.params.cid);
  if (!cart) {
    return res.status(404).json({ message: 'El carrito no existe' });
  }
  res.json(cart.products);
});

// Método GET para mostrar un producto específico dentro de un carrito
router.get('/api/carts/:cid/product/:pid', (req, res) => {
  const cart = findCartById(req.params.cid);
  if (!cart) {
    return res.status(404).json({ message: 'El carrito no existe' });
  }
  const productInCart = findProductInCart(cart, req.params.pid);
  if (!productInCart) {
    return res.status(404).json({ message: 'El producto no existe en el carrito' });
  }
  res.status(200).json(productInCart);
});

// Método POST para agregar productos al carrito
router.post('/api/carts', async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || !products.every(product => 'name' in product && 'description' in product && 'price' in product && 'stock' in product)) {
    return res.status(400).json({ error: 'Datos de producto no válidos' });
  }

  const newCart = {
    id: cartIdCounter++,
    products: products.map((product, index) => ({
      id: index + 1,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock
    }))
  };

  carts.push(newCart);
  await writeFile(cartsFilePath, carts);

  res.status(201).json(newCart);
});

// Método POST para agregar un producto al carrito por ID de carrito y ID de producto
router.post('/api/carts/:cid/product/:pid', async (req, res) => {
  const cart = findCartById(req.params.cid);
  if (!cart) {
    return res.status(404).json({ message: 'El carrito no existe' });
  }

  const productId = parseInt(req.params.pid);
  const productInCart = findProductInCart(cart, productId);

  if (productInCart) {
    if (productInCart.quantity) {
      productInCart.quantity += 1;
    } else {
      productInCart.quantity = 2;
    }
  } else {
    cart.products.push({ id: productId, quantity: 1 });
  }

  await writeFile(cartsFilePath, carts);
  res.status(201).json(cart);
});

export default router;
