const express = require('express');
const router = express.Router();
const productoModel = require('../models/productoModel');

router.get('/', (req, res) => {
  try {
    const productos = productoModel.findAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/buscar', (req, res) => {
  try {
    const productos = productoModel.search(req.query.nombre || '');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const producto = productoModel.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.post('/', (req, res) => {
  try {
    const producto = productoModel.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el producto' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const producto = productoModel.update(req.params.id, req.body);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    productoModel.remove(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
